import { FormEvent, useState } from "react";
import { submitEnquiry } from "@/lib/propdesk/submissions";

export function EnquiryForm({
  kind,
  types,
}: {
  kind: "firm" | "contact";
  types: string[];
}) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setStatus("");
    const out = await submitEnquiry({
      data: {
        kind,
        firmName: String(form.get("firmname") || ""),
        officialWebsite: String(form.get("officialwebsite") || ""),
        contactName: String(form.get("contactname") || ""),
        email: String(form.get("businessemail") || ""),
        role: String(form.get("jobtitle") || ""),
        enquiryType: String(form.get("enquirytype") || ""),
        message: String(form.get("message") || ""),
        sourceUrl: String(form.get("sourceurl") || ""),
      },
    });
    setBusy(false);
    if (!out.ok) {
      setStatus(out.error);
      return;
    }
    setRef(out.id);
    e.currentTarget.reset();
  }

  if (ref) {
    return (
      <p className="rounded-md border border-line bg-elev px-3 py-3 text-sm">
        Received. Reference <span className="font-medium">{ref}</span>. This is stored for review. It is not an email confirmation.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      {kind === "firm" ? (
        <>
          <Field name="firmname" label="Prop Firm Name" required />
          <Field name="officialwebsite" label="Official Website" type="url" required placeholder="https://" />
          <Field name="jobtitle" label="Role or Department" required />
        </>
      ) : null}
      <Field name="contactname" label="Your Name" required />
      <Field name="businessemail" label="Business Email" type="email" required />
      <label className="text-sm font-semibold">
        How Can We Help?
        <select name="enquirytype" required className="mt-1 h-11 w-full rounded-md border border-line bg-elev px-3 font-normal">
          <option value="">Choose</option>
          {types.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Message
        <textarea name="message" required minLength={12} rows={5} className="mt-1 w-full rounded-md border border-line bg-elev px-3 py-2 font-normal" />
      </label>
      <Field name="sourceurl" label="Official Source URL" type="url" placeholder="https://" />
      {status ? <p className="text-sm text-bad">{status}</p> : null}
      <button type="submit" disabled={busy} className="h-11 rounded-md bg-paper font-display font-semibold text-ink disabled:opacity-50">
        {busy ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} className="mt-1 h-11 w-full rounded-md border border-line bg-elev px-3 font-normal" />
    </label>
  );
}
