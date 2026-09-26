import { create } from "zustand";
import { persist } from "zustand/middleware";
import { staffAdd, staffGate, staffMessages, staffPost, staffRoster } from "./staff.server";
import {
  STAFF_CHANNELS,
  canOpenChannel,
  channelsFor,
  isStaffChannel,
  type StaffChannel,
  type StaffMember,
  type StaffMessage,
  type StaffRole,
  type StaffSession,
} from "./staff";

type StaffState = {
  session: StaffSession | null;
  channel: StaffChannel;
  messages: StaffMessage[];
  roster: StaffMember[];
  sending: boolean;
  loading: boolean;
  error: string | null;
  setChannel: (channel: StaffChannel) => void;
  signIn: (email: string, invite?: string) => Promise<boolean>;
  signOut: () => void;
  load: () => Promise<void>;
  send: (body: string) => Promise<void>;
  loadRoster: () => Promise<void>;
  addMember: (email: string, role: StaffRole, name?: string) => Promise<boolean>;
};

export const useStaffStore = create<StaffState>()(
  persist(
    (set, get) => ({
      session: null,
      channel: "support",
      messages: [],
      roster: [],
      sending: false,
      loading: false,
      error: null,

      setChannel: (channel) => {
        const session = get().session;
        if (!session || !canOpenChannel(session.role, channel)) return;
        set({ channel });
        void get().load();
      },

      signIn: async (email, invite) => {
        set({ error: null, loading: true });
        try {
          const out = await staffGate({ data: { email, invite } });
          if (!out.ok) {
            set({ error: out.error, loading: false, session: null });
            return false;
          }
          const open = channelsFor(out.staff.role)[0] ?? "support";
          set({ session: out.staff, channel: open, error: null, loading: false });
          void get().load();
          return true;
        } catch {
          set({ error: "Could not reach the staff desk.", loading: false });
          return false;
        }
      },

      signOut: () => set({ session: null, messages: [], roster: [], error: null }),

      load: async () => {
        const session = get().session;
        if (!session) return;
        const channel = get().channel;
        set({ loading: true });
        try {
          const out = await staffMessages({ data: { email: session.email, channel } });
          if (out.ok) set({ messages: out.messages, loading: false });
          else set({ loading: false, error: "Could not load that channel." });
        } catch {
          set({ loading: false });
        }
      },

      send: async (body) => {
        const session = get().session;
        const text = body.trim();
        if (!session || !text || get().sending) return;
        set({ sending: true, error: null });
        try {
          const out = await staffPost({
            data: { email: session.email, channel: get().channel, body: text },
          });
          if (out.ok) set({ messages: [...get().messages, out.message] });
          else set({ error: "Message did not send." });
        } catch {
          set({ error: "Message did not send." });
        } finally {
          set({ sending: false });
        }
      },

      loadRoster: async () => {
        const session = get().session;
        if (!session || session.role !== "admin") return;
        const out = await staffRoster({ data: { email: session.email } });
        if (out.ok) set({ roster: out.members });
      },

      addMember: async (email, role, name) => {
        const session = get().session;
        if (!session || session.role !== "admin") return false;
        const out = await staffAdd({
          data: { email: session.email, memberEmail: email, role, name },
        });
        if (!out.ok) return false;
        set({ roster: [...get().roster.filter((m) => m.email !== out.member.email), out.member] });
        return true;
      },
    }),
    {
      name: "propdesk-staff-v1",
      partialize: (s) => ({ session: s.session, channel: s.channel }),
    },
  ),
);

export function staffChannelMeta(id: string) {
  return STAFF_CHANNELS.find((c) => c.id === id) ?? STAFF_CHANNELS[0];
}

export function openStaffChannel(id: string): StaffChannel {
  return isStaffChannel(id) ? id : "support";
}
