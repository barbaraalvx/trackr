export interface RawActivityItem {
  type: "done_today" | "plan_tomorrow" | "blocker" | "comment";
  description: string;
}

export function splitTextareaToItems(
  text: string,
  type: "done_today" | "plan_tomorrow" | "blocker" | "comment"
): RawActivityItem[] {
  if (!text || !text.trim()) return [];

  const lines = text.split("\n");
  return lines
    .map((line) => line.replace(/^[-*•\s]+/, "").trim())
    .filter((line) => line.length > 0)
    .map((description) => ({
      type,
      description,
    }));
}
