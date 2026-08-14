import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  pgEnum,
  integer,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const itemTypeEnum = pgEnum("item_type", [
  "done_today",
  "plan_tomorrow",
  "blocker",
  "comment",
]);

export const periodTypeEnum = pgEnum("period_type", [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
]);

// 1. contexts (Indicium, Pessoal, Estudos...)
export const contexts = pgTable("contexts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#3b82f6"),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 2. categories (Bug, Feature, Reunião...)
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#10b981"),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 3. entries (raw entry record)
export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  rawText: text("raw_text").notNull().default(""),
  entryDate: date("entry_date").notNull(),
  contextId: uuid("context_id").references(() => contexts.id, {
    onDelete: "set null",
  }),
  parsed: boolean("parsed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 4. activity_items (items extracted per line)
export const activityItems = pgTable("activity_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryId: uuid("entry_id")
    .notNull()
    .references(() => entries.id, { onDelete: "cascade" }),
  type: itemTypeEnum("type").notNull(),
  description: text("description").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 5. artifacts (links)
export const artifacts = pgTable("artifacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryId: uuid("entry_id")
    .notNull()
    .references(() => entries.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 6. entry_categories (N:N relationship)
export const entryCategories = pgTable(
  "entry_categories",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.entryId, table.categoryId] }),
  ]
);

// 7. summaries (cached AI summaries)
export const summaries = pgTable("summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  periodType: periodTypeEnum("period_type").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  contextId: uuid("context_id").references(() => contexts.id, {
    onDelete: "set null",
  }),
  content: text("content").notNull(),
  insightsJson: jsonb("insights_json"),
  metricsJson: jsonb("metrics_json"),
  isClosedPeriod: boolean("is_closed_period").notNull().default(false),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  regeneratedCount: integer("regenerated_count").notNull().default(0),
});

// 8. settings (single global config row)
export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  requireConfirmationBeforeSave: boolean("require_confirmation_before_save")
    .notNull()
    .default(true),
});

// Relations
export const entriesRelations = relations(entries, ({ one, many }) => ({
  context: one(contexts, {
    fields: [entries.contextId],
    references: [contexts.id],
  }),
  activityItems: many(activityItems),
  artifacts: many(artifacts),
  entryCategories: many(entryCategories),
}));

export const activityItemsRelations = relations(activityItems, ({ one }) => ({
  entry: one(entries, {
    fields: [activityItems.entryId],
    references: [entries.id],
  }),
}));

export const artifactsRelations = relations(artifacts, ({ one }) => ({
  entry: one(entries, {
    fields: [artifacts.entryId],
    references: [entries.id],
  }),
}));

export const entryCategoriesRelations = relations(
  entryCategories,
  ({ one }) => ({
    entry: one(entries, {
      fields: [entryCategories.entryId],
      references: [entries.id],
    }),
    category: one(categories, {
      fields: [entryCategories.categoryId],
      references: [categories.id],
    }),
  })
);
