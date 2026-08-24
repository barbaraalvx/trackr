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
import { revalidatePath } from "next/cache";

export interface TimelineFilterParams {
  contextId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

// ─── Edit / Delete Entry ──────────────────────────────────────────────────────

export interface UpdateEntryPayload {
  entryId: string;
  entryDate: string;
  contextId?: string | null;
  categoryIds: string[];
  activityItems: {
    id?: string;       // existing item (update) or undefined (new)
    type: "done_today" | "plan_tomorrow" | "blocker" | "comment";
    title: string;
    description: string;
  }[];
  artifacts: {
    id?: string;
    label: string;
    url: string;
  }[];
}

export async function updateEntry(payload: UpdateEntryPayload) {
  const { entryId, entryDate, contextId, categoryIds } = payload;

  // 1. Update entry header (date + context)
  await db
    .update(entries)
    .set({
      entryDate,
      contextId: contextId || null,
    })
    .where(eq(entries.id, entryId));

  // 2. Replace activity items — delete all, re-insert
  await db.delete(activityItems).where(eq(activityItems.entryId, entryId));
  if (payload.activityItems.length > 0) {
    await db.insert(activityItems).values(
      payload.activityItems.map((item) => ({
        entryId,
        type: item.type,
        title: item.title || null,
        description: item.description,
      }))
    );
  }

  // 3. Replace artifacts
  await db.delete(artifacts).where(eq(artifacts.entryId, entryId));
  const validArtifacts = payload.artifacts.filter((a) => a.url.trim());
  if (validArtifacts.length > 0) {
    await db.insert(artifacts).values(
      validArtifacts.map((a) => ({
        entryId,
        url: a.url,
        label: a.label || null,
      }))
    );
  }

  // 4. Replace categories
  await db.delete(entryCategories).where(eq(entryCategories.entryId, entryId));
  if (categoryIds.length > 0) {
    await db.insert(entryCategories).values(
      categoryIds.map((catId) => ({ entryId, categoryId: catId }))
    );
  }

  revalidatePath("/timeline");
  revalidatePath("/");
}

export async function deleteEntry(entryId: string) {
  // Cascades delete activityItems, artifacts, entryCategories
  await db.delete(entries).where(eq(entries.id, entryId));
  revalidatePath("/timeline");
  revalidatePath("/");
}


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
