import { InvalidTokenError } from "@modelcontextprotocol/sdk/server/auth/errors.js";
import type { OAuthTokenVerifier } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../env.js";

// The security core of spec 0005 (AC-3, AC-11).
//
// Tally is an OAuth resource server: it never issues tokens, it only checks the
// ones that arrive. The SDK's requireBearerAuth middleware calls this, but it
// only validates scopes and expiry itself, so EVERY other check is ours:
// signature, issuer, audience, and algorithm. A mistake here is the whole
// security boundary, which is why AC-11 tests a correctly signed token that was
// meant for someone else.
//
// The keys are public, so no Clerk secret is needed anywhere in this codebase.

const ISSUER = env.CLERK_ISSUER_URL ?? "";
const AUDIENCE = env.TALLY_RESOURCE_URL ?? "";

// Fetches and caches Clerk's public signing keys, and refetches when they
// rotate. Created once at module load, not per request.
const jwks = ISSUER
  ? createRemoteJWKSet(new URL("/.well-known/jwks.json", ISSUER))
  : null;

/** What a verified token tells us about the person behind the request. */
export interface Principal {
  /** The provider's stable user id (the `sub` claim). The identity key. */
  subject: string;
  /** The user's email, when the provider supplies it. */
  email: string | null;
}

/** Reads our principal back out of an AuthInfo. `AuthInfo` has no subject field
 * of its own, so identity rides in `extra` (verified upstream, never trusted
 * from the request). */
export function principalFrom(auth: AuthInfo | undefined): Principal | null {
  const extra = auth?.extra as { subject?: unknown; email?: unknown } | undefined;
  if (!extra || typeof extra.subject !== "string" || extra.subject.length === 0) return null;
  return {
    subject: extra.subject,
    email: typeof extra.email === "string" && extra.email.length > 0 ? extra.email : null,
  };
}

export const clerkTokenVerifier: OAuthTokenVerifier = {
  async verifyAccessToken(token: string): Promise<AuthInfo> {
    if (!jwks) throw new Error("token verification is not configured");

    // jwtVerify does signature, expiry, issuer, and audience in one call, and
    // its typed API rejects an unexpected algorithm rather than trusting the
    // token's own `alg` header. Passing issuer and audience EXPLICITLY is what
    // stops a token minted by the same Clerk instance for a different
    // application from being accepted here.
    let payload;
    try {
      ({ payload } = await jwtVerify(token, jwks, {
        issuer: ISSUER,
        audience: AUDIENCE,
        algorithms: ["RS256"],
      }));
    } catch (e) {
      // Log WHY a token was rejected, never the token itself or its contents
      // (AC-10). jose reports a stable machine readable code, which is exactly
      // the amount of detail that is useful and safe.
      const reason =
        typeof e === "object" && e !== null && "code" in e
          ? String((e as { code?: unknown }).code)
          : "verification failed";
      console.warn(`[tally] rejected a token: ${reason}`);
      // Must be InvalidTokenError specifically: requireBearerAuth answers 401
      // with the WWW-Authenticate challenge ONLY for this type, and turns
      // anything else into a bare 500. A rejected token is a normal, expected
      // outcome that the client must be told how to recover from (AC-1), not a
      // server fault.
      throw new InvalidTokenError(reason);
    }

    const subject = payload.sub;
    if (typeof subject !== "string" || subject.length === 0) {
      console.warn("[tally] rejected a token: no subject claim");
      throw new InvalidTokenError("token has no subject");
    }

    const scopeClaim = payload["scope"];
    const scopes = typeof scopeClaim === "string" ? scopeClaim.split(" ").filter(Boolean) : [];
    const emailClaim = payload["email"];

    return {
      token,
      clientId: typeof payload["azp"] === "string" ? payload["azp"] : "",
      scopes,
      expiresAt: payload.exp,
      extra: {
        subject,
        email: typeof emailClaim === "string" ? emailClaim : null,
      },
    };
  },
};
