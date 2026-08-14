import React from "react";

export function renderMarkdownText(text: string): React.ReactNode {
  if (!text) return null;

  // Split lines
  const lines = text.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-2" />;

        // Check if list item
        const isBullet = /^\s*[-*•]\s+/.test(line);
        const cleanLine = line.replace(/^\s*[-*•]\s+/, "");

        // Process inline markdown (**bold**, *italic*, `code`)
        const formatted = parseInlineMarkdown(cleanLine);

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 text-xs">
              <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
              <span>{formatted}</span>
            </div>
          );
        }

        return (
          <div key={lineIdx} className="text-xs">
            {formatted}
          </div>
        );
      })}
    </div>
  );
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  // Regex to match **bold**, *italic*, `code`, and [label](url)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-indigo-300 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
