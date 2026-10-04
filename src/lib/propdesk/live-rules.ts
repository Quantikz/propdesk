import { createServerFn } from "@tanstack/react-start";
import { firmValue } from "./value";

export type LiveRuleStamp = {
  id: string;
  checkedAt: string;
  source: string;
  lines: string[];
  ok: boolean;
};

const cache = new Map<string, { at: number; stamp: LiveRuleStamp }>();
const TTL = 30 * 60 * 1000;

function linesFrom(html: string) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const bits = text.split(/(?<=[.?!])\s+/);
  const hit = bits.filter((line) =>
    /drawdown|daily loss|max(?:imum)? loss|profit target|minimum .{0,12}day|trading day|consistency/i.test(line) &&
    /\d/.test(line),
  );
  return [...new Set(hit.map((line) => line.trim().slice(0, 220)))].slice(0, 5);
}

export const getLiveRuleStamp = createServerFn({ method: "POST" })
  .validator((input: { firmId?: string }) => ({ firmId: String(input.firmId || "") }))
  .handler(async ({ data }) => {
    const source = firmValue(data.firmId).terms;
    const host = (() => {
      try {
        return new URL(source).hostname;
      } catch {
        return "";
      }
    })();
    if (!host || !/^https:/.test(source)) {
      return { id: data.firmId, checkedAt: new Date().toISOString(), source, lines: [], ok: false } satisfies LiveRuleStamp;
    }
    const hit = cache.get(data.firmId);
    if (hit && Date.now() - hit.at < TTL) return hit.stamp;
    try {
      const res = await fetch(source, {
        headers: { Accept: "text/html", "User-Agent": "PropDesk/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(String(res.status));
      const previous = hit?.stamp.lines.join(" ") ?? "";
      const stamp: LiveRuleStamp = {
        id: data.firmId,
        checkedAt: new Date().toISOString(),
        source,
        lines: linesFrom(await res.text()),
        ok: true,
      };
      if (previous && previous !== stamp.lines.join(" ")) {
        try {
          const { getSql } = await import("@/lib/db");
          const sql = await getSql();
          await sql`
            insert into rule_changes (firm_id, before, after)
            values (${data.firmId}, ${previous.slice(0, 500)}, ${stamp.lines.join(" ").slice(0, 500)})
          `;
        } catch {
          /* log is optional */
        }
      }
      cache.set(data.firmId, { at: Date.now(), stamp });
      return stamp;
    } catch {
      const stamp: LiveRuleStamp = {
        id: data.firmId,
        checkedAt: new Date().toISOString(),
        source,
        lines: [],
        ok: false,
      };
      return stamp;
    }
  });
