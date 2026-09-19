import { createServerFn } from "@tanstack/react-start";
import type { CatalogPayload } from "./catalog-cache";

export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogPayload> => {
    const { cachedCatalog } = await import("./catalog.server");
    return cachedCatalog();
  },
);
