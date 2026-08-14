import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var _postgresClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var _drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function getDb() {
  if (globalThis._drizzleDb) return globalThis._drizzleDb;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "[trackr] DATABASE_URL is not set. Add it to your environment variables."
    );
  }

  const client =
    globalThis._postgresClient ??
    postgres(connectionString, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalThis._postgresClient = client;
  }

  globalThis._drizzleDb = drizzle(client, { schema });
  return globalThis._drizzleDb;
}

// Lazy proxy: the postgres client is only created when the first query runs,
// not at module import time. This prevents build errors when DATABASE_URL is
// absent in the Vercel build environment.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
