import { env } from "../env.js";
import { client, db } from "./client.js";
import { modules, users } from "./schema.js";

// Idempotent seed: the single v1 user (id = DEFAULT_USER_ID) and its launch
// module registry row. Safe to run more than once.
async function seed(): Promise<void> {
  await db.insert(users).values({ id: env.DEFAULT_USER_ID }).onConflictDoNothing();
  await db
    .insert(modules)
    .values({ userId: env.DEFAULT_USER_ID, key: "launch" })
    .onConflictDoNothing();
  console.log("[seed] default user and launch module ready");
  await client.end();
}

seed().catch((err: unknown) => {
  console.error("[seed] failed:", err);
  process.exitCode = 1;
});
