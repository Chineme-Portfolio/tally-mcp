import "dotenv/config";
import { z } from "zod";

// All environment reading happens here, once, validated (code-standards.md
// section 9). A missing or bad value fails loudly at startup, not later at a
// random call site. dotenv loads a local .env if present (dev); on Railway the
// vars are injected and dotenv is a no op.

/** The sentinel subject for the single local user in AUTH_MODE=none. Real
 * accounts carry the identity provider's subject instead. */
export const LOCAL_AUTH_SUBJECT = "local-no-auth";

const RawEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // The single user in AUTH_MODE=none. Ignored entirely in oauth mode, where
  // accounts are created from verified tokens on first sign in.
  DEFAULT_USER_ID: z.string().uuid("DEFAULT_USER_ID must be a uuid"),
  // Authentication (spec 0005). Read as a plain string on purpose, so that an
  // unexpected value fails closed below rather than failing validation open.
  AUTH_MODE: z.string().optional(),
  // The Clerk instance that issues and signs tokens. Its JWKS is discovered
  // from this, and every token's `iss` must match it.
  CLERK_ISSUER_URL: z.string().url().optional(),
  // Tally's canonical public URL: published as the protected resource
  // identifier and checked against each token's audience.
  TALLY_RESOURCE_URL: z.string().url().optional(),
  NODE_ENV: z.string().optional(),
});

const raw = RawEnvSchema.parse(process.env);

// FAIL CLOSED. Only the exact string "none" disables authentication. Unset,
// empty, misspelled, or anything unexpected leaves authentication ON, so a
// misconfiguration can never reproduce an open server (spec 0005 AC-6).
const authMode: "oauth" | "none" = raw.AUTH_MODE?.trim() === "none" ? "none" : "oauth";

// The second, independent guard. One stray environment variable copied from a
// local .env must not be able to reopen the public server, which is exactly how
// Tally ended up open before. Any of these signals means "this is not a laptop".
function looksLikeProduction(): string | null {
  if (raw.NODE_ENV === "production") return "NODE_ENV=production";
  if (process.env.RAILWAY_ENVIRONMENT) {
    return `RAILWAY_ENVIRONMENT=${process.env.RAILWAY_ENVIRONMENT}`;
  }
  if (raw.TALLY_RESOURCE_URL) {
    const host = new URL(raw.TALLY_RESOURCE_URL).hostname;
    const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
    if (!local) return `TALLY_RESOURCE_URL points at ${host}`;
  }
  return null;
}

if (authMode === "none") {
  const productionSignal = looksLikeProduction();
  if (productionSignal) {
    throw new Error(
      `AUTH_MODE=none refused: this looks like a deployed environment (${productionSignal}). ` +
        "Running without authentication would expose every board to anyone with the URL. " +
        "Unset AUTH_MODE to run authenticated, or use AUTH_MODE=none only on localhost.",
    );
  }
} else {
  // In oauth mode these two are required; there is no safe default for either.
  if (!raw.CLERK_ISSUER_URL) {
    throw new Error(
      "CLERK_ISSUER_URL is required when authentication is on (set AUTH_MODE=none for a local single user instance).",
    );
  }
  if (!raw.TALLY_RESOURCE_URL) {
    throw new Error(
      "TALLY_RESOURCE_URL is required when authentication is on: it is the resource identifier tokens are checked against.",
    );
  }
}

export const env = {
  PORT: raw.PORT,
  DATABASE_URL: raw.DATABASE_URL,
  DEFAULT_USER_ID: raw.DEFAULT_USER_ID,
  AUTH_MODE: authMode,
  CLERK_ISSUER_URL: raw.CLERK_ISSUER_URL,
  TALLY_RESOURCE_URL: raw.TALLY_RESOURCE_URL,
} as const;

/** True when requests must carry a verified access token. */
export const authRequired = authMode === "oauth";
