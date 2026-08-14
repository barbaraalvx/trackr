import React from "react";

export function renderMarkdownText(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-2" />;

        // Heading: ## or #
        const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const content = parseInlineMarkdown(headingMatch[2]);
          const cls =
            level === 1
              ? "font-serif font-medium text-sm text-[#2C2C2A] mt-2"
              : level === 2
              ? "font-serif font-medium text-xs text-[#2C2C2A] mt-1.5 uppercase tracking-wide"
              : "font-medium text-xs text-[#5F5E5A] mt-1";
          return (
            <div key={lineIdx} className={cls}>
              {content}
            </div>
          );
        }

        // Bullet list item
        const isBullet = /^\s*[-*•]\s+/.test(line);
        const cleanLine = line.replace(/^\s*[-*•]\s+/, "");
        const formatted = parseInlineMarkdown(cleanLine);

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 text-xs">
              <span className="text-[#712B13] font-bold shrink-0 mt-0.5">•</span>
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
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#2C2C2A]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-[#5F5E5A]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-[#EFECE6] px-1.5 py-0.5 rounded border border-[#D3D1C7] text-[#712B13] font-mono text-[11px]"
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
          className="text-[#712B13] hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
