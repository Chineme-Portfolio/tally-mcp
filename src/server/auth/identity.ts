import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { env, LOCAL_AUTH_SUBJECT } from "../env.js";
import type { Principal } from "./verifier.js";

// Identity mapping (spec 0005, AC-3 and AC-5): turn a verified token's subject
// into the Tally account it owns. This is the ONLY place identity enters the
// application, and the only place a UserId is minted.

/**
 * A Tally account's id. It is a plain uuid string at runtime, but branded so
 * the compiler can tell it apart from every other string. That matters: the
 * repository functions take a user id next to other string arguments, and
 * without a brand, transposing them (`editItem(id, userId, title)`) would
 * compile cleanly and quietly hand one person another person's data. With the
 * brand, only a value minted here can be passed as the owner.
 */
export type UserId = string & { readonly __brand: unique symbol };

function asUserId(id: string): UserId {
  return id as UserId;
}

/**
 * Find the account for this principal, creating it on first sign in.
 *
 * Clerk's account linking means one person keeps one subject across Google and
 * GitHub, so the subject is a stable identity key. The insert is race safe: two
 * requests arriving together collide on the unique index, one wins, and both
 * read back the same row.
 */
export async function resolveAccount(principal: Principal): Promise<UserId> {
  const [existing] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.authSubject, principal.subject))
    .limit(1);

  if (existing) {
    // Keep the email current if it changed at the provider.
    if (principal.email !== null && principal.email !== existing.email) {
      await db
        .update(users)
        .set({ email: principal.email })
        .where(and(eq(users.id, existing.id), eq(users.authSubject, principal.subject)));
    }
    return asUserId(existing.id);
  }

  await db
    .insert(users)
    .values({ authSubject: principal.subject, email: principal.email })
    .onConflictDoNothing({ target: users.authSubject });

  const [created] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authSubject, principal.subject))
    .limit(1);

  if (!created) throw new Error("could not resolve or create an account for this token");
  return asUserId(created.id);
}

/**
 * The account used when AUTH_MODE=none. There is no identity provider and no
 * token, so every request is attributed to the one local user the seed wrote.
 * Never reachable on a deployed server: env.ts refuses that mode outside
 * localhost.
 */
export function localAccount(): UserId {
  return asUserId(env.DEFAULT_USER_ID);
}

export { LOCAL_AUTH_SUBJECT };
