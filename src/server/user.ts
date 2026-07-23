import { env } from "./env.js";

// Single tenant in v1: the user is always the seeded default user. This is the
// ONE place scope comes from (foundation.md §7 #6, code-standards.md §5). The
// day this goes multi tenant, change only this function to read the
// authenticated principal instead of the env constant; every query is already
// scoped by its return value, so nothing else changes.
export function resolveUserId(): string {
  return env.DEFAULT_USER_ID;
}
