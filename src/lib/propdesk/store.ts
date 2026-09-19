import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chat, ChatMessage, PendingFile } from "./types";
import { completeTicket } from "./complete";
import { classify, getFirm, isValidEmail, think, type EngineReply } from "./engine";

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
  aiOpen: boolean;
  liveAi: boolean;
  toast: string | null;
  setFirm: (id: string) => void;
  setEmail: (v: string) => void;
  setAccountId: (v: string) => void;
  setSidebarOpen: (v: boolean) => void;
  openProfile: (force?: boolean) => void;
  closeProfile: () => void;
  saveProfile: (email: string, accountId: string) => void;
  openAi: () => void;
  closeAi: () => void;
  setLiveAi: (v: boolean) => void;
  showToast: (msg: string) => void;
  newChat: () => void;
  openChat: (id: string) => void;
  deleteChat: (id: string) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  send: (textFromSuggest?: string) => Promise<void>;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useDeskStore = create<DeskState>()(
  persist(
    (set, get) => ({
      firmId: "ftmo",
      email: "",
      accountId: "",
      chats: [],
      activeId: null,
      pendingFiles: [],
      sending: false,
      sidebarOpen: false,
      profileOpen: false,
      profileForce: false,
      aiOpen: false,
      liveAi: true,
      toast: null,

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
      openAi: () => set({ aiOpen: true, sidebarOpen: false }),
      closeAi: () => set({ aiOpen: false }),
      setLiveAi: (v) => {
        set({ liveAi: v, aiOpen: false });
        get().showToast(v ? "Live AI on — Grok will reply" : "Live AI off — FAQ engine only");
      },
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

        const { intent } = classify(text, files.length > 0);
        if (intent === "escalate" && !isValidEmail(get().email)) {
          set({ profileOpen: true, profileForce: true });
        }

        try {
          const firm = getFirm(get().firmId);
          const email = get().email;
          const accountId = get().accountId;
          let reply: EngineReply | null = null;

          const useLive = get().liveAi && intent !== "escalate";

          if (useLive) {
            const history =
              get()
                .chats.find((c) => c.id === chatId)
                ?.messages.map((m) => ({ role: m.role, content: m.content })) ?? [];
            const out = await completeTicket({
              data: {
                firmId: firm.id,
                email,
                accountId,
                files: files.map((f) => f.name),
                messages: history,
              },
            });
            if (out.ok) {
              reply = {
                text: out.text,
                chips: [
                  { text: out.sources?.length ? "Live site" : "Live AI", tone: "ok" },
                  { text: firm.short, tone: "" },
                ],
                sources: out.sources ?? [],
              };
            }
          }

          if (!reply) {
            if (useLive) get().showToast("Live AI missed — using FAQ engine");
            else await new Promise((r) => setTimeout(r, 280));
            reply = think(firm, text, files, email, accountId);
          }

          const assistant: ChatMessage = {
            role: "assistant",
            content: reply.text,
            chips: reply.chips,
            caseDraft: reply.caseDraft ?? null,
            sources: reply.sources,
            ts: Date.now(),
          };
          set({
            chats: get().chats.map((c) =>
              c.id === chatId ? { ...c, messages: [...c.messages, assistant] } : c,
            ),
          });
        } catch (err) {
          console.error(err);
          get().showToast("Could not draft a reply. Try again.");
        } finally {
          set({ sending: false });
        }
      },
    }),
    {
      name: "propdesk-v1",
      skipHydration: true,
      partialize: (s) => ({
        firmId: s.firmId,
        email: s.email,
        accountId: s.accountId,
        chats: s.chats,
        activeId: s.activeId,
        liveAi: s.liveAi,
      }),
    },
  ),
);
