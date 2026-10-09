import type { ReactNode } from "react";

/**
 * Renders the post body written in the admin panel.
 *
 * Deliberately NOT dangerouslySetInnerHTML: the body is stored as plain text and
 * rendered as React nodes, so a post can never inject markup or script into the
 * page. Supported: blank-line paragraphs, `## heading`, `- bullet`.
 */
export default function PostBody({ body }: { body: string }) {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="post-body">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}
            </ul>
          );
        }
        if (lines[0].startsWith("### ")) return <h3 key={i}>{lines[0].slice(4)}</h3>;
        if (lines[0].startsWith("## ")) return <h2 key={i}>{lines[0].slice(3)}</h2>;

        const out: ReactNode[] = [];
        lines.forEach((l, j) => {
          if (j > 0) out.push(<br key={`br${j}`} />);
          out.push(l);
        });
        return <p key={i}>{out}</p>;
      })}
    </div>
  );
}
