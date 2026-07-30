import { env, LOCAL_AUTH_SUBJECT } from "../env.js";
import { client, db } from "./client.js";
import { boards, modules, users } from "./schema.js";

// Idempotent seed, run after db:migrate on every deploy. Safe to run more than
// once (every insert is onConflictDoNothing).
//
// With authentication ON there is nothing to seed: an account is created from a
// verified token the first time someone signs in, and their first board is
// created on demand. Seeding a user here would only invent an account nobody
// can sign in as.
//
// With AUTH_MODE=none (local development, or a single user self hosted
// instance) there is no identity provider, so this writes the one local user
// that every request is attributed to, plus a board to render.
async function seed(): Promise<void> {
  if (env.AUTH_MODE !== "none") {
    console.log("[seed] auth is on: accounts are created on first sign in, nothing to seed");
    await client.end();
    return;
  }

  await db
    .insert(users)
    .values({ id: env.DEFAULT_USER_ID, authSubject: LOCAL_AUTH_SUBJECT })
    .onConflictDoNothing();
  await db
    .insert(modules)
    .values({ userId: env.DEFAULT_USER_ID, key: "board" })
    .onConflictDoNothing();
  await db
    .insert(boards)
    .values({ userId: env.DEFAULT_USER_ID, name: "Launch readiness" })
    .onConflictDoNothing();
  console.log("[seed] local user, board module, and Launch readiness board ready");
  await client.end();
}

seed().catch((err: unknown) => {
  console.error("[seed] failed:", err);
  process.exitCode = 1;
});
