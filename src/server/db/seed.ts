import { env } from "../env.js";
import { client, db } from "./client.js";
import { boards, modules, users } from "./schema.js";

// Idempotent seed: the single v1 user (id = DEFAULT_USER_ID), its board module
// registry row, and a default "Launch readiness" board so a fresh deploy has one
// to render. Safe to run more than once (every insert is onConflictDoNothing);
// runs after db:migrate on each deploy.
async function seed(): Promise<void> {
  await db.insert(users).values({ id: env.DEFAULT_USER_ID }).onConflictDoNothing();
  await db
    .insert(modules)
    .values({ userId: env.DEFAULT_USER_ID, key: "board" })
    .onConflictDoNothing();
  await db
    .insert(boards)
    .values({ userId: env.DEFAULT_USER_ID, name: "Launch readiness" })
    .onConflictDoNothing();
  console.log("[seed] default user, board module, and Launch readiness board ready");
  await client.end();
}

seed().catch((err: unknown) => {
  console.error("[seed] failed:", err);
  process.exitCode = 1;
});
