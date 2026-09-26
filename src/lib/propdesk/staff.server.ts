import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  canOpenChannel,
  channelsFor,
  isStaffChannel,
  isStaffRole,
  normEmail,
  parseRosterEnv,
  STAFF_SEED,
  type StaffMember,
  type StaffMessage,
  type StaffSession,
} from "./staff";

const memoryMembers = new Map<string, StaffMember>();
const memoryMessages: StaffMessage[] = [];

function seedMemory() {
  if (memoryMembers.size) return;
  for (const m of [...STAFF_SEED, ...parseRosterEnv(process.env.STAFF_ROSTER)]) {
    memoryMembers.set(m.email, m);
  }
}

async function withDb<T>(fn: (sql: Awaited<ReturnType<typeof getSql>>) => Promise<T>): Promise<T | null> {
  try {
    const sql = await getSql();
    return await fn(sql);
  } catch {
    return null;
  }
}

async function lookupMember(email: string): Promise<StaffMember | null> {
  const key = normEmail(email);
  if (!key) return null;
  seedMemory();
  const fromDb = await withDb(async (sql) => {
    const rows = await sql<{ email: string; role: string; name: string }>`
      select email, role, name from staff_members where email = ${key}
    `;
    return rows[0] ?? null;
  });
  if (fromDb && isStaffRole(fromDb.role)) {
    return { email: fromDb.email, role: fromDb.role, name: fromDb.name || key };
  }
  return memoryMembers.get(key) ?? null;
}

async function upsertMember(member: StaffMember) {
  memoryMembers.set(member.email, member);
  await withDb(async (sql) => {
    await sql`
      insert into staff_members (email, role, name)
      values (${member.email}, ${member.role}, ${member.name})
      on conflict (email) do update set role = excluded.role, name = excluded.name
    `;
    return true;
  });
}

function inviteOk(code: string) {
  const expected = (process.env.STAFF_INVITE || "").trim();
  if (!expected) return true;
  return code.trim() === expected;
}

export const staffGate = createServerFn({ method: "POST" })
  .validator((input: { email: string; invite?: string }) => ({
    email: normEmail(String(input.email || "")),
    invite: String(input.invite || ""),
  }))
  .handler(async ({ data }): Promise<{ ok: true; staff: StaffSession } | { ok: false; error: string }> => {
    if (!data.email || !data.email.includes("@")) {
      return { ok: false, error: "Use a work email on the roster." };
    }
    if (!inviteOk(data.invite)) {
      return { ok: false, error: "Invite code does not match." };
    }
    let member = await lookupMember(data.email);
    if (!member) {
      seedMemory();
      const empty = memoryMembers.size === 0;
      const inviteSet = Boolean((process.env.STAFF_INVITE || "").trim());
      if (empty && inviteSet && inviteOk(data.invite)) {
        member = {
          email: data.email,
          role: "admin",
          name: data.email.split("@")[0] || "Admin",
        };
        memoryMembers.set(member.email, member);
        await withDb(async (sql) => {
          await sql`
            insert into staff_members (email, role, name)
            values (${member!.email}, ${member!.role}, ${member!.name})
            on conflict (email) do nothing
          `;
          return true;
        });
      }
    }
    if (!member) {
      return { ok: false, error: "That email is not on the staff roster." };
    }
    return {
      ok: true,
      staff: { email: member.email, role: member.role, name: member.name },
    };
  });

export const staffMessages = createServerFn({ method: "POST" })
  .validator((input: { email: string; channel: string }) => ({
    email: normEmail(String(input.email || "")),
    channel: String(input.channel || ""),
  }))
  .handler(async ({ data }): Promise<{ ok: true; messages: StaffMessage[] } | { ok: false; error: string }> => {
    const member = await lookupMember(data.email);
    if (!member) return { ok: false, error: "staff" };
    if (!isStaffChannel(data.channel) || !canOpenChannel(member.role, data.channel)) {
      return { ok: false, error: "channel" };
    }
    const fromDb = await withDb(async (sql) => {
      const rows = await sql<{
        id: string;
        channel: string;
        author: string;
        role: string;
        body: string;
        created_at: string;
      }>`
        select id, channel, author, role, body, created_at
        from staff_messages
        where channel = ${data.channel}
        order by created_at asc
        limit 200
      `;
      return rows
        .filter((r) => isStaffChannel(r.channel) && isStaffRole(r.role))
        .map((r) => ({
          id: r.id,
          channel: r.channel,
          author: r.author,
          role: r.role,
          body: r.body,
          ts: Date.parse(r.created_at) || Date.now(),
        }));
    });
    const local = memoryMessages.filter((m) => m.channel === data.channel);
    const merged = new Map<string, StaffMessage>();
    for (const m of [...local, ...(fromDb ?? [])]) merged.set(m.id, m);
    return { ok: true, messages: [...merged.values()].sort((a, b) => a.ts - b.ts) };
  });

export const staffPost = createServerFn({ method: "POST" })
  .validator((input: { email: string; channel: string; body: string }) => ({
    email: normEmail(String(input.email || "")),
    channel: String(input.channel || ""),
    body: String(input.body || "").slice(0, 4000).trim(),
  }))
  .handler(async ({ data }): Promise<{ ok: true; message: StaffMessage } | { ok: false; error: string }> => {
    const member = await lookupMember(data.email);
    if (!member) return { ok: false, error: "staff" };
    if (!isStaffChannel(data.channel) || !canOpenChannel(member.role, data.channel)) {
      return { ok: false, error: "channel" };
    }
    if (!data.body) return { ok: false, error: "empty" };
    const message: StaffMessage = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      channel: data.channel,
      author: member.name || member.email,
      role: member.role,
      body: data.body,
      ts: Date.now(),
    };
    memoryMessages.push(message);
    await withDb(async (sql) => {
      await sql`
        insert into staff_messages (id, channel, author, role, body)
        values (${message.id}, ${message.channel}, ${message.author}, ${message.role}, ${message.body})
      `;
      return true;
    });
    return { ok: true, message };
  });

export const staffRoster = createServerFn({ method: "POST" })
  .validator((input: { email: string }) => ({ email: normEmail(String(input.email || "")) }))
  .handler(async ({ data }): Promise<{ ok: true; members: StaffMember[] } | { ok: false; error: string }> => {
    const me = await lookupMember(data.email);
    if (!me || me.role !== "admin") return { ok: false, error: "admin" };
    seedMemory();
    const fromDb = await withDb(async (sql) => {
      const rows = await sql<{ email: string; role: string; name: string }>`
        select email, role, name from staff_members order by role, email
      `;
      return rows.filter((r) => isStaffRole(r.role)) as StaffMember[];
    });
    const merged = new Map<string, StaffMember>();
    for (const m of [...memoryMembers.values(), ...(fromDb ?? [])]) merged.set(m.email, m);
    return { ok: true, members: [...merged.values()].sort((a, b) => a.email.localeCompare(b.email)) };
  });

export const staffAdd = createServerFn({ method: "POST" })
  .validator((input: { email: string; memberEmail: string; role: string; name?: string }) => ({
    email: normEmail(String(input.email || "")),
    memberEmail: normEmail(String(input.memberEmail || "")),
    role: String(input.role || ""),
    name: String(input.name || "").trim(),
  }))
  .handler(async ({ data }): Promise<{ ok: true; member: StaffMember } | { ok: false; error: string }> => {
    const me = await lookupMember(data.email);
    if (!me || me.role !== "admin") return { ok: false, error: "admin" };
    if (!data.memberEmail.includes("@") || !isStaffRole(data.role)) {
      return { ok: false, error: "invalid" };
    }
    const member: StaffMember = {
      email: data.memberEmail,
      role: data.role,
      name: data.name || data.memberEmail.split("@")[0] || "Staff",
    };
    await upsertMember(member);
    return { ok: true, member };
  });

export function staffPreview(session: StaffSession) {
  return { ...session, channels: channelsFor(session.role) };
}
