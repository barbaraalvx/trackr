"use server";

import { db } from "@/lib/db";
import {
  entries,
  activityItems,
  artifacts,
  entryCategories,
  settings,
  contexts,
  categories,
} from "@/lib/db/schema";
import { splitTextareaToItems, RawActivityItem } from "@/lib/utils/text-splitter";
import { generateTitlesForItems } from "@/lib/ai/title-generator";
import { getAppSettings } from "@/app/admin/actions";
import { revalidatePath } from "next/cache";

export interface ItemWithTitle {
  type: "done_today" | "plan_tomorrow" | "blocker" | "comment";
  description: string;
  title: string;
}

export interface ArtifactInput {
  url: string;
  label?: string;
}

export async function processAndPrepareEntry(data: {
  doneToday: string;
  planTomorrow: string;
  blockers: string;
  comments: string;
  contextId?: string;
  categoryIds: string[];
  artifactsList: ArtifactInput[];
  entryDate: string;
}) {
  const allRawItems: RawActivityItem[] = [
    ...splitTextareaToItems(data.doneToday, "done_today"),
    ...splitTextareaToItems(data.planTomorrow, "plan_tomorrow"),
    ...splitTextareaToItems(data.blockers, "blocker"),
    ...splitTextareaToItems(data.comments, "comment"),
  ];

  const itemsForAI = allRawItems.map((item, idx) => ({
    index: idx,
    type: item.type,
    description: item.description,
  }));

  const titles = await generateTitlesForItems(itemsForAI);
  const titlesMap = new Map(titles.map((t) => [t.index, t.title]));

  const itemsWithTitles: ItemWithTitle[] = allRawItems.map((item, idx) => ({
    ...item,
    title: titlesMap.get(idx) || item.description.split(" ").slice(0, 7).join(" "),
  }));

  const appSettings = await getAppSettings();

  return {
    requireConfirmation: appSettings.requireConfirmationBeforeSave,
    preparedData: {
      rawText: [
        data.doneToday && `Feito hoje:\n${data.doneToday}`,
        data.planTomorrow && `Planejado amanhã:\n${data.planTomorrow}`,
        data.blockers && `Bloqueios:\n${data.blockers}`,
        data.comments && `Comentários:\n${data.comments}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      entryDate: data.entryDate,
      contextId: data.contextId || null,
      categoryIds: data.categoryIds,
      artifactsList: data.artifactsList.filter((a) => a.url && a.url.trim()),
      items: itemsWithTitles,
    },
  };
}

export async function saveEntry(data: {
  rawText: string;
  entryDate: string;
  contextId?: string | null;
  categoryIds: string[];
  artifactsList: ArtifactInput[];
  items: ItemWithTitle[];
}) {
  // 1. Create entry
  const [insertedEntry] = await db
    .insert(entries)
    .values({
      rawText: data.rawText,
      entryDate: data.entryDate,
      contextId: data.contextId || null,
      parsed: true,
    })
    .returning();

  const entryId = insertedEntry.id;

  // 2. Insert items
  if (data.items.length > 0) {
    await db.insert(activityItems).values(
      data.items.map((item) => ({
        entryId,
        type: item.type,
        description: item.description,
        title: item.title,
      }))
    );
  }

  // 3. Insert artifacts
  if (data.artifactsList.length > 0) {
    await db.insert(artifacts).values(
      data.artifactsList.map((art) => ({
        entryId,
        url: art.url.trim(),
        label: art.label?.trim() || null,
      }))
    );
  }

  // 4. Insert entry categories
  if (data.categoryIds.length > 0) {
    await db.insert(entryCategories).values(
      data.categoryIds.map((catId) => ({
        entryId,
        categoryId: catId,
      }))
    );
  }

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");

  return { success: true, entryId };
}
