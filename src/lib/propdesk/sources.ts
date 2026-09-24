import { orderFirmIds } from "./engine";
import { firmsMentioned } from "./faq";
import type { CatalogPayload } from "./catalog-cache";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type Source = { url: string; title?: string };
export type DeskMode = "desk" | "compare";

export function packIdsFor(
  mode: DeskMode,
  firmId: string,
  firmIds: string[],
  messages: ChatTurn[],
) {
  const userBlob = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
  const mentioned = firmsMentioned(userBlob, firmId);
  return orderFirmIds(
    mode === "compare" ? Array.from(new Set([...firmIds, ...mentioned])) : mentioned,
  ).slice(0, 4);
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function hostAllowed(host: string, allowed: Set<string>) {
  if (!host) return false;
  if (allowed.has(host)) return true;
  for (const a of allowed) {
    if (a && (host === a || host.endsWith(`.${a}`))) return true;
  }
  return false;
}

export function allowedHosts(cat: CatalogPayload, ids: string[], payoutAsk: boolean) {
  const hosts = new Set<string>();
  for (const id of ids) {
    for (const h of cat.hosts[id] ?? []) hosts.add(h.replace(/^www\./, "").toLowerCase());
    const portal = cat.firms.find((f) => f.id === id)?.portal;
    if (portal) {
      const h = hostOf(portal);
      if (h) hosts.add(h);
    }
  }
  if (payoutAsk) {
    hosts.add("payoutjunction.com");
    hosts.add("propfirmmatch.com");
  }
  return hosts;
}

export function officialSources(cat: CatalogPayload, ids: string[]): Source[] {
  return ids
    .map((id) => cat.firms.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f?.portal))
    .map((f) => ({ url: f.portal, title: hostOf(f.portal) || f.name }));
}

export function filterSources(raw: Source[], allowed: Set<string>, official: Source[]): Source[] {
  const out = new Map<string, Source>();
  for (const s of official) out.set(s.url, s);
  for (const s of raw) {
    const h = hostOf(s.url);
    if (!hostAllowed(h, allowed)) continue;
    if (!out.has(s.url)) out.set(s.url, { url: s.url, title: s.title || h });
  }
  return [...out.values()].slice(0, 6);
}
