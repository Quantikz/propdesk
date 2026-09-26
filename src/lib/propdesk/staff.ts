export type StaffRole = "admin" | "support" | "mod";
export type StaffChannel = "support" | "mods";

export type StaffMember = {
  email: string;
  role: StaffRole;
  name: string;
};

export type StaffSession = {
  email: string;
  role: StaffRole;
  name: string;
};

export type StaffMessage = {
  id: string;
  channel: StaffChannel;
  author: string;
  role: StaffRole;
  body: string;
  ts: number;
};

export const STAFF_CHANNELS: {
  id: StaffChannel;
  label: string;
  blurb: string;
  roles: StaffRole[];
}[] = [
  {
    id: "support",
    label: "Support",
    blurb: "Trader tickets, payout holds, firm-fault cases.",
    roles: ["admin", "support"],
  },
  {
    id: "mods",
    label: "Mods",
    blurb: "Rule flags, abuse, account bans.",
    roles: ["admin", "mod"],
  },
];

/** Edit this list to grant Staff access. Env STAFF_ROSTER can add more. */
export const STAFF_SEED: StaffMember[] = [
  // { email: "you@propfirm.support", role: "admin", name: "Owner" },
];

export function normEmail(raw: string) {
  return raw.trim().toLowerCase();
}

export function isStaffRole(v: string): v is StaffRole {
  return v === "admin" || v === "support" || v === "mod";
}

export function isStaffChannel(v: string): v is StaffChannel {
  return v === "support" || v === "mods";
}

export function canOpenChannel(role: StaffRole, channel: StaffChannel) {
  const spec = STAFF_CHANNELS.find((c) => c.id === channel);
  return Boolean(spec?.roles.includes(role));
}

export function channelsFor(role: StaffRole): StaffChannel[] {
  return STAFF_CHANNELS.filter((c) => c.roles.includes(role)).map((c) => c.id);
}

export function roleLabel(role: StaffRole) {
  if (role === "admin") return "Admin";
  if (role === "support") return "Support";
  return "Mod";
}

export function parseRosterEnv(raw: string | undefined): StaffMember[] {
  if (!raw?.trim()) return [];
  const out: StaffMember[] = [];
  for (const part of raw.split(/[,;\n]+/)) {
    const [email, role, name] = part.split(":").map((s) => s.trim());
    if (!email || !role || !isStaffRole(role.toLowerCase())) continue;
    out.push({
      email: normEmail(email),
      role: role.toLowerCase() as StaffRole,
      name: name || email.split("@")[0] || "Staff",
    });
  }
  return out;
}
