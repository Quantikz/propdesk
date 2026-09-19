import type { Firm } from "./types";
import type { FirstPayout, Plan } from "./plans";
import type { FaqItem } from "./faq";

export type FirmLink = { kind: string; title: string; url: string };

export type CatalogPayload = {
  firms: Firm[];
  faqs: Record<string, FaqItem[]>;
  plans: Record<string, Plan[]>;
  first: Record<string, FirstPayout>;
  links: Record<string, FirmLink[]>;
  hosts: Record<string, string[]>;
};

let overlay: CatalogPayload | null = null;

export function hydrateCatalog(payload: CatalogPayload) {
  overlay = payload;
}

export function catalogOverlay() {
  return overlay;
}
