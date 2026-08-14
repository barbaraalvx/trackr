"use server";

import { db } from "@/lib/db";
import { contexts, categories, settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Contexts
export async function getContexts() {
  return await db.select().from(contexts).orderBy(contexts.createdAt);
}

export async function createContext(formData: FormData) {
  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || "#3b82f6";
  const textColor = (formData.get("textColor") as string) || null;

  if (!name || !name.trim()) return;

  await db.insert(contexts).values({
    name: name.trim(),
    color,
    textColor,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");
}

export async function updateContext(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const textColor = (formData.get("textColor") as string) || null;

  if (!name || !name.trim()) return;

  await db
    .update(contexts)
    .set({
      name: name.trim(),
      color,
      textColor,
    })
    .where(eq(contexts.id, id));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");
}

export async function toggleArchiveContext(id: string, currentArchived: boolean) {
  await db
    .update(contexts)
    .set({ archived: !currentArchived })
    .where(eq(contexts.id, id));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");
}

export async function deleteContext(id: string) {
  await db.delete(contexts).where(eq(contexts.id, id));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");
}

// Categories
export async function getCategories() {
  return await db.select().from(categories).orderBy(categories.createdAt);
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || "#10b981";
  const textColor = (formData.get("textColor") as string) || null;

  if (!name || !name.trim()) return;

  await db.insert(categories).values({
    name: name.trim(),
    color,
    textColor,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const textColor = (formData.get("textColor") as string) || null;

  if (!name || !name.trim()) return;

  await db
    .update(categories)
    .set({
      name: name.trim(),
      color,
      textColor,
    })
    .where(eq(categories.id, id));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");
}

export async function toggleArchiveCategory(id: string, currentArchived: boolean) {
  await db
    .update(categories)
    .set({ archived: !currentArchived })
    .where(eq(categories.id, id));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");
}

// Settings
export async function getAppSettings() {
  const existing = await db.select().from(settings).limit(1);
  if (existing.length === 0) {
    const inserted = await db
      .insert(settings)
      .values({ requireConfirmationBeforeSave: true })
      .returning();
    return inserted[0];
  }
  return existing[0];
}

export async function updateRequireConfirmation(value: boolean) {
  const existing = await getAppSettings();
  await db
    .update(settings)
    .set({ requireConfirmationBeforeSave: value })
    .where(eq(settings.id, existing.id));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/summaries");
}
