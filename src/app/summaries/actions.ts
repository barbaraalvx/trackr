"use server";

import { db } from "@/lib/db";
import { summaries, entries, activityItems, contexts } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { calculatePeriodDates } from "@/lib/utils/period-calculator";
import { generateSummaryWithGemini, GroupedDayData } from "@/lib/ai/summary-generator";
import { revalidatePath } from "next/cache";

export async function getSavedSummaries() {
  return await db
    .select()
    .from(summaries)
    .orderBy(desc(summaries.generatedAt))
    .limit(50);
}


export async function getOrGenerateSummary(params: {
  periodType: "daily" | "weekly" | "biweekly" | "monthly" | "custom";
  contextId?: string;
  referenceDate?: string;
  customStartDate?: string;
  customEndDate?: string;
  forceRegenerate?: boolean;
}) {
  const { periodStart, periodEnd, isClosedPeriod } = calculatePeriodDates(
    params.periodType,
    params.referenceDate,
    params.customStartDate,
    params.customEndDate
  );

  const contextId = params.contextId || null;

  // 1. Check Cache if closed period and not forcing regenerate
  if (isClosedPeriod && !params.forceRegenerate) {
    const existingCache = await db.query.summaries.findFirst({
      where: and(
        eq(summaries.periodType, params.periodType),
        eq(summaries.periodStart, periodStart),
        eq(summaries.periodEnd, periodEnd),
        contextId ? eq(summaries.contextId, contextId) : eq(summaries.contextId, null as any)
      ),
    });

    if (existingCache) {
      return {
        fromCache: true,
        summaryRecord: existingCache,
      };
    }
  }

  // 2. Fetch entries & activity items in range
  const matchedEntries = await db.query.entries.findMany({
    where: and(
      gte(entries.entryDate, periodStart),
      lte(entries.entryDate, periodEnd),
      contextId ? eq(entries.contextId, contextId) : undefined
    ),
    orderBy: [desc(entries.entryDate)],
    with: {
      context: true,
      activityItems: true,
    },
  });

  // Calculate local metrics
  let totalDone = 0;
  let totalPlan = 0;
  let totalBlockers = 0;
  let totalComments = 0;

  const groupedData: GroupedDayData[] = matchedEntries.map((e) => {
    e.activityItems.forEach((item) => {
      if (item.type === "done_today") totalDone++;
      if (item.type === "plan_tomorrow") totalPlan++;
      if (item.type === "blocker") totalBlockers++;
      if (item.type === "comment") totalComments++;
    });

    return {
      date: e.entryDate,
      contextName: e.context?.name,
      items: e.activityItems.map((i) => ({
        type: i.type,
        title: i.title || i.description,
        description: i.description,
      })),
    };
  });

  const metricsJson = {
    totalEntries: matchedEntries.length,
    totalItems: totalDone + totalPlan + totalBlockers + totalComments,
    doneCount: totalDone,
    planCount: totalPlan,
    blockersCount: totalBlockers,
    commentsCount: totalComments,
  };

  // 3. Call Gemini AI Generator
  const aiResult = await generateSummaryWithGemini(
    params.periodType,
    periodStart,
    periodEnd,
    groupedData
  );

  // 4. Save to Database (upsert or update existing)
  const existingSummary = await db.query.summaries.findFirst({
    where: and(
      eq(summaries.periodType, params.periodType),
      eq(summaries.periodStart, periodStart),
      eq(summaries.periodEnd, periodEnd),
      contextId ? eq(summaries.contextId, contextId) : eq(summaries.contextId, null as any)
    ),
  });

  let summaryRecord;

  if (existingSummary) {
    const [updated] = await db
      .update(summaries)
      .set({
        content: aiResult.summary,
        insightsJson: aiResult.insights,
        metricsJson: metricsJson,
        isClosedPeriod: isClosedPeriod,
        generatedAt: new Date(),
        regeneratedCount: existingSummary.regeneratedCount + 1,
      })
      .where(eq(summaries.id, existingSummary.id))
      .returning();
    summaryRecord = updated;
  } else {
    const [inserted] = await db
      .insert(summaries)
      .values({
        periodType: params.periodType,
        periodStart: periodStart,
        periodEnd: periodEnd,
        contextId: contextId,
        content: aiResult.summary,
        insightsJson: aiResult.insights,
        metricsJson: metricsJson,
        isClosedPeriod: isClosedPeriod,
        regeneratedCount: 0,
      })
      .returning();
    summaryRecord = inserted;
  }

  revalidatePath("/summaries");

  return {
    fromCache: false,
    summaryRecord,
  };
}
