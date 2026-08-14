"use server";

import { db } from "@/lib/db";
import {
  entries,
  activityItems,
  artifacts,
  entryCategories,
  contexts,
  categories,
} from "@/lib/db/schema";
import { eq, desc, and, gte, lte, inArray } from "drizzle-orm";

export interface TimelineFilterParams {
  contextId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export async function getTimelineEntries(filters: TimelineFilterParams = {}) {
  // Find entry IDs matching category filter if categoryId is provided
  let filteredEntryIds: string[] | null = null;
  if (filters.categoryId) {
    const matched = await db
      .select({ entryId: entryCategories.entryId })
      .from(entryCategories)
      .where(eq(entryCategories.categoryId, filters.categoryId));
    filteredEntryIds = matched.map((m) => m.entryId);
    if (filteredEntryIds.length === 0) return [];
  }

  const conditions = [];

  if (filters.contextId) {
    conditions.push(eq(entries.contextId, filters.contextId));
  }
  if (filters.startDate) {
    conditions.push(gte(entries.entryDate, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(entries.entryDate, filters.endDate));
  }
  if (filteredEntryIds !== null) {
    conditions.push(inArray(entries.id, filteredEntryIds));
  }

  const results = await db.query.entries.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(entries.entryDate), desc(entries.createdAt)],
    with: {
      context: true,
      activityItems: true,
      artifacts: true,
      entryCategories: {
        with: {
          category: true,
        },
      },
    },
  });

  return results;
}
