import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing in .env.local");
  process.exit(1);
}

console.log("Connecting to database...");
const sql = postgres(connectionString, { max: 1, ssl: "require" });
const db = drizzle(sql);

async function run() {
  try {
    console.log("Running migrations from ./drizzle...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

run();
