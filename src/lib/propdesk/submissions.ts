import { createServerFn } from "@tanstack/react-start";

export type EnquiryInput = {
  kind?: "firm" | "contact";
  firmName?: string;
  officialWebsite?: string;
  contactName?: string;
  email?: string;
  role?: string;
  enquiryType?: string;
  message?: string;
  sourceUrl?: string;
};

const hits = new Map<string, number[]>();

function allow(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 5) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

function clean(value: string, max: number) {
  return value.replace(/[<>]/g, "").trim().slice(0, max);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((input: EnquiryInput) => ({
    kind: input.kind === "firm" ? "firm" : "contact",
    firmName: clean(String(input.firmName || ""), 80),
    officialWebsite: clean(String(input.officialWebsite || ""), 200),
    contactName: clean(String(input.contactName || ""), 80),
    email: clean(String(input.email || ""), 120).toLowerCase(),
    role: clean(String(input.role || ""), 80),
    enquiryType: clean(String(input.enquiryType || ""), 80),
    message: clean(String(input.message || ""), 2000),
    sourceUrl: clean(String(input.sourceUrl || ""), 200),
  }))
  .handler(async ({ data }) => {
    if (!allow(data.email || "anon")) return { ok: false as const, error: "Too many submissions. Try again shortly." };
    if (!data.contactName || !isEmail(data.email) || !data.enquiryType || data.message.length < 12) {
      return { ok: false as const, error: "Name, a valid email, a category, and a message are required." };
    }
    if (data.kind === "firm" && (!data.firmName || !isUrl(data.officialWebsite) || !data.role)) {
      return { ok: false as const, error: "Firm name, an https website, and your role are required." };
    }
    if (data.sourceUrl && !isUrl(data.sourceUrl)) return { ok: false as const, error: "Source URL must be https." };
    const id = `PD-${Date.now().toString(36).toUpperCase()}`;
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into submissions (
        id, kind, firm_name, official_website, contact_name, email, role,
        enquiry_type, message, source_url, status
      ) values (
        ${id}, ${data.kind}, ${data.firmName || null}, ${data.officialWebsite || null},
        ${data.contactName}, ${data.email}, ${data.role || null}, ${data.enquiryType},
        ${data.message}, ${data.sourceUrl || null}, ${"Received"}
      )
    `;
    return { ok: true as const, id };
  });
