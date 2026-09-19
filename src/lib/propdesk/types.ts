export type Firm = {
  id: string;
  name: string;
  short: string;
  color: string;
  supportEmail: string;
  portal: string;
  models: string[];
  platforms: string[];
  profitSplit: string;
  payoutCycle: string;
  payoutSlaDays: number;
  maxAccount: string;
  drawdown: string;
  consistency: string;
  news: string;
  ea: string;
  kyc: string;
  notes: string;
};

export type Topic = {
  id: string;
  tags: string[];
  title: string;
  answer: (firm: Firm) => string;
};

export type KnowledgeBase = {
  version: string;
  disclaimer: string;
  firms: Record<string, Firm>;
  topics: Topic[];
  escalateSignals: string[];
  notFirmFaultSignals: string[];
};

export type ChipTone = "ok" | "warn" | "bad" | "";

export type CaseDraft = {
  id: string;
  to: string;
  firmName: string;
  subject: string;
  body: string;
};

export type FileRef = {
  name: string;
  size: number;
  type: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  files?: FileRef[];
  chips?: { text: string; tone?: ChipTone }[];
  caseDraft?: CaseDraft | null;
  sources?: { url: string; title?: string }[];
  ts: number;
};

export type Chat = {
  id: string;
  title: string;
  firmId: string;
  createdAt: number;
  messages: ChatMessage[];
};

export type PendingFile = FileRef & { file: File };
