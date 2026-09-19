import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chat, ChatMessage, PendingFile } from "./types";
import { completeTicket } from "./complete";
import { getFirm, orderFirmIds } from "./engine";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

type DeskState = {
  firmId: string;
  email: string;
  accountId: string;
  chats: Chat[];
  activeId: string | null;
  pendingFiles: PendingFile[];
  sending: boolean;
  sidebarOpen: boolean;
  profileOpen: boolean;
  profileForce: boolean;
  toast: string | null;
  compareIds: string[];
  compareMessages: ChatMessage[];
  compareSending: boolean;
  setFirm: (id: string) => void;
  setEmail: (v: string) => void;
  setAccountId: (v: string) => void;
  setSidebarOpen: (v: boolean) => void;
  openProfile: (force?: boolean) => void;
  closeProfile: () => void;
  saveProfile: (email: string, accountId: string) => void;
  showToast: (msg: string) => void;
  newChat: () => void;
  openChat: (id: string) => void;
  deleteChat: (id: string) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  send: (textFromSuggest?: string) => Promise<void>;
  setCompareIds: (ids: string[]) => void;
  toggleCompare: (id: string) => void;
  sendCompare: (textFromSuggest?: string) => Promise<void>;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useDeskStore = create<DeskState>()(
  persist(
    (set, get) => ({
      firmId: "goat",
      email: "",
      accountId: "",
      chats: [],
      activeId: null,
      pendingFiles: [],
      sending: false,
      sidebarOpen: false,
      profileOpen: false,
      profileForce: false,
      toast: null,
      compareIds: ["goat", "ftmo"],
      compareMessages: [],
      compareSending: false,

      setFirm: (id) => {
        set({ firmId: id, sidebarOpen: false });
        get().showToast(`${getFirm(id).name} selected`);
      },
      setEmail: (v) => set({ email: v.trim() }),
      setAccountId: (v) => set({ accountId: v.trim() }),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      openProfile: (force = false) =>
        set({ profileOpen: true, profileForce: force, sidebarOpen: false }),
      closeProfile: () => set({ profileOpen: false, profileForce: false }),
      saveProfile: (email, accountId) =>
        set({
          email: email.trim(),
          accountId: accountId.trim(),
          profileOpen: false,
          profileForce: false,
        }),
      showToast: (msg) => {
        if (toastTimer) clearTimeout(toastTimer);
        set({ toast: msg });
        toastTimer = setTimeout(() => set({ toast: null }), 2400);
      },

      newChat: () => {
        const chat: Chat = {
          id: uid(),
          title: "New ticket",
          firmId: get().firmId,
          createdAt: Date.now(),
          messages: [],
        };
        set({ chats: [chat, ...get().chats], activeId: chat.id, sidebarOpen: false });
      },

      openChat: (id) => set({ activeId: id, sidebarOpen: false }),

      deleteChat: (id) => {
        const chats = get().chats.filter((c) => c.id !== id);
        const activeId = get().activeId === id ? (chats[0]?.id ?? null) : get().activeId;
        set({ chats, activeId });
      },

      addFiles: (files) => {
        const next = files.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          file,
        }));
        set({ pendingFiles: [...get().pendingFiles, ...next] });
      },
      removeFile: (index) =>
        set({ pendingFiles: get().pendingFiles.filter((_, i) => i !== index) }),

      send: async (textFromSuggest) => {
        const text = (textFromSuggest || "").trim();
        if (!text || get().sending) return;

        let { activeId, chats } = get();
        if (!activeId || !chats.find((c) => c.id === activeId)) {
          const chat: Chat = {
            id: uid(),
            title: "New ticket",
            firmId: get().firmId,
            createdAt: Date.now(),
            messages: [],
          };
          chats = [chat, ...chats];
          activeId = chat.id;
        }

        const files = get().pendingFiles.map(({ name, size, type }) => ({
          name,
          size,
          type,
        }));
        const userMsg: ChatMessage = { role: "user", content: text, files, ts: Date.now() };
        const chatId = activeId;

        chats = chats.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            firmId: get().firmId,
            title: c.title === "New ticket" ? text.slice(0, 42) : c.title,
            messages: [...c.messages, userMsg],
          };
        });

        set({ chats, activeId: chatId, pendingFiles: [], sending: true, sidebarOpen: false });

        try {
          const firm = getFirm(get().firmId);
          const history =
            get()
              .chats.find((c) => c.id === chatId)
              ?.messages.map((m) => ({ role: m.role, content: m.content })) ?? [];

          const out = await completeTicket({
            data: {
              firmId: firm.id,
              firmIds: [firm.id],
              mode: "desk",
              messages: history,
            },
          });

          const assistant: ChatMessage = out.ok
            ? {
                role: "assistant",
                content: out.text,
                chips: out.sources?.length
                  ? [{ text: "Checked live", tone: "ok" }, { text: firm.short, tone: "" }]
                  : [{ text: firm.short, tone: "" }],
                sources: out.sources ?? [],
                ts: Date.now(),
              }
            : {
                role: "assistant",
                content: "I missed that — send it once more.",
                chips: [{ text: firm.short, tone: "warn" }],
                ts: Date.now(),
              };

          set({
            chats: get().chats.map((c) =>
              c.id === chatId ? { ...c, messages: [...c.messages, assistant] } : c,
            ),
          });
        } catch (err) {
          console.error(err);
          get().showToast("Could not send. Try again.");
        } finally {
          set({ sending: false });
        }
      },

      setCompareIds: (ids) => {
        const unique = orderFirmIds(ids).slice(0, 4);
        if (unique.length >= 2) set({ compareIds: unique });
      },
      toggleCompare: (id) => {
        const cur = get().compareIds;
        if (cur.includes(id)) {
          if (cur.length <= 2) return;
          set({ compareIds: orderFirmIds(cur.filter((x) => x !== id)) });
          return;
        }
        if (cur.length >= 4) set({ compareIds: orderFirmIds([...cur.slice(1), id]) });
        else set({ compareIds: orderFirmIds([...cur, id]) });
      },
      sendCompare: async (textFromSuggest) => {
        const text = (textFromSuggest || "").trim();
        if (!text || get().compareSending) return;
        const userMsg: ChatMessage = { role: "user", content: text, ts: Date.now() };
        const ids = get().compareIds;
        set({
          compareMessages: [...get().compareMessages, userMsg],
          compareSending: true,
          sidebarOpen: false,
        });
        try {
          const history = [...get().compareMessages].map((m) => ({
            role: m.role,
            content: m.content,
          }));
          const out = await completeTicket({
            data: {
              firmId: ids[0] ?? "goat",
              firmIds: ids,
              mode: "compare",
              messages: history,
            },
          });
          const label = ids.map((id) => getFirm(id).short).join(" · ");
          const assistant: ChatMessage = out.ok
            ? {
                role: "assistant",
                content: out.text,
                chips: out.sources?.length
                  ? [{ text: "Checked live", tone: "ok" }, { text: label, tone: "" }]
                  : [{ text: label, tone: "" }],
                sources: out.sources ?? [],
                ts: Date.now(),
              }
            : {
                role: "assistant",
                content: "I missed that — send it once more.",
                chips: [{ text: label, tone: "warn" }],
                ts: Date.now(),
              };
          set({ compareMessages: [...get().compareMessages, assistant] });
        } catch (err) {
          console.error(err);
          get().showToast("Could not send. Try again.");
        } finally {
          set({ compareSending: false });
        }
      },
    }),
    {
      name: "propdesk-v3",
      skipHydration: true,
      partialize: (s) => ({
        firmId: s.firmId,
        email: s.email,
        accountId: s.accountId,
        chats: s.chats,
        activeId: s.activeId,
        compareIds: s.compareIds,
        compareMessages: s.compareMessages,
      }),
    },
  ),
);
