import type { ReactNode } from "react";

function applyInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|`([^`]+)`|\[(.+?)\]\((https?:\/\/[^\s)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index));
    }
    if (m[2]) {
      nodes.push(<strong key={`${keyBase}-b-${i}`}>{m[2]}</strong>);
    } else if (m[3]) {
      nodes.push(
        <code
          key={`${keyBase}-c-${i}`}
          className="rounded-sm bg-hover px-1 py-0.5 font-mono text-[0.9em]"
        >
          {m[3]}
        </code>,
      );
    } else if (m[4] && m[5]) {
      nodes.push(
        <a
          key={`${keyBase}-a-${i}`}
          href={m[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ok underline-offset-2 hover:underline"
        >
          {m[4]}
        </a>,
      );
    }
    last = m.index + m[0].length;
    i += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {applyInline(line, `l${i}`)}
          {i < lines.length - 1 ? "\n" : null}
        </span>
      ))}
    </>
  );
}
