import type { ReactNode } from "react";

function applyInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[(.+?)\]\((https?:\/\/[^\s)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2]) {
      nodes.push(<strong key={`${keyBase}-b-${i}`}>{m[2]}</strong>);
    } else if (m[3]) {
      nodes.push(<em key={`${keyBase}-i-${i}`}>{m[3]}</em>);
    } else if (m[4]) {
      nodes.push(
        <code
          key={`${keyBase}-c-${i}`}
          className="rounded-sm bg-hover px-1 py-0.5 font-mono text-[0.9em]"
        >
          {m[4]}
        </code>,
      );
    } else if (m[5] && m[6]) {
      nodes.push(
        <a
          key={`${keyBase}-a-${i}`}
          href={m[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ok underline-offset-2 hover:underline"
        >
          {m[5]}
        </a>,
      );
    }
    last = m.index + m[0].length;
    i += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function isFence(line: string) {
  return /^\s*\|?\s*:?-{3,}/.test(line.replace(/\|/g, "|"));
}

function splitCells(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function looksLikeTable(lines: string[]) {
  const rows = lines.filter((l) => l.includes("|"));
  return rows.length >= 2 && rows.every((l) => (l.match(/\|/g) || []).length >= 1);
}

export function RichText({ text }: { text: string }) {
  const raw = text.replace(/\r\n/g, "\n").trim();
  const blocks: string[][] = [];
  let cur: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.trim() === "") {
      if (cur.length) {
        blocks.push(cur);
        cur = [];
      }
    } else {
      cur.push(line);
    }
  }
  if (cur.length) blocks.push(cur);

  return (
    <>
      {blocks.map((block, bi) => {
        const first = block[0]?.trim() ?? "";
        if (/^#{1,3}\s/.test(first)) {
          const title = first.replace(/^#{1,3}\s+/, "").replace(/\*/g, "");
          return (
            <h3 key={bi} className="mt-2 mb-1 font-display text-base font-semibold first:mt-0">
              {title}
            </h3>
          );
        }
        if (looksLikeTable(block)) {
          const rows = block.filter((l) => l.includes("|") && !isFence(l.trim()));
          if (rows.length) {
            const head = splitCells(rows[0]);
            const body = rows.slice(1).map(splitCells);
            return (
              <div key={bi} className="my-2 overflow-x-auto">
                <table className="w-full min-w-[16rem] border-collapse text-left text-[13px]">
                  <thead>
                    <tr>
                      {head.map((h, i) => (
                        <th key={i} className="border-b border-line py-1.5 pr-3 font-medium text-muted">
                          {applyInline(h, `th${bi}-${i}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {body.map((cells, ri) => (
                      <tr key={ri}>
                        {cells.map((c, ci) => (
                          <td key={ci} className="border-b border-border py-1.5 pr-3 align-top">
                            {applyInline(c, `td${bi}-${ri}-${ci}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }
        const list = block.every((l) => /^\s*[-*•]\s+/.test(l) || /^\s*\d+\.\s+/.test(l));
        if (list) {
          return (
            <ul key={bi} className="my-1.5 list-disc space-y-1 pl-4">
              {block.map((l, i) => (
                <li key={i}>{applyInline(l.replace(/^\s*(?:[-*•]|\d+\.)\s+/, ""), `li${bi}-${i}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="my-1.5 first:mt-0 last:mb-0">
            {block.map((line, i) => (
              <span key={i}>
                {applyInline(line, `p${bi}-${i}`)}
                {i < block.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
