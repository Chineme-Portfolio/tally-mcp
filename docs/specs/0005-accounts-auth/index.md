# 0005. Accounts and authentication: real multi user Tally

**Date**: 2026-07-25
**Status**: Proposed

## Summary

Tally is deployed publicly with no authentication, so every visitor who adds the connector operates the **same** board as the owner. This spec makes Tally a real multi user product: each person signs in (Google or GitHub, handled by Clerk) and gets their own private boards. Tally itself never renders a sign in page and never sees a password. It becomes an **OAuth resource server**, which means its only job is to check the access token that arrives with each request and turn it into "which user is this". The signed in user is then passed explicitly into every database call, so the ownership boundary is visible in the code rather than implied.

## Requirements

**User stories**:
- As the owner, I want my boards to be private, so a stranger who opens my portfolio link cannot read or change my data.
- As a visitor, I want to sign in and get my own boards, so I can actually try Tally without colliding with anyone else.
- As a visitor, I want to sign in with Google or GitHub, so there is no new password and almost no friction.
- As a self hoster (or the owner working locally), I want to run Tally without configuring an identity provider at all.
- As the owner, I want a ceiling on what one account can create, so a single visitor cannot run up my database bill.

**Acceptance criteria** (the contract, each independently checkable):
- **AC-1**: In auth mode, a request to `/mcp` with no valid token is rejected with HTTP 401 and a `WWW-Authenticate: Bearer` header that carries the `resource_metadata` URL.
- **AC-2**: The RFC 9728 protected resource metadata document is served and names Clerk as the authorization server and Tally's resource identifier as the protected resource. Its exact path is **derived from the SDK's `getOAuthProtectedResourceMetadataUrl()`**, not assumed: the SDK appends the resource URL's pathname, so a resource identifier of `https://host` serves it at `/.well-known/oauth-protected-resource` while `https://host/mcp` serves it at `/.well-known/oauth-protected-resource/mcp`. The path advertised in the AC-1 challenge and the path actually served must be the same value, derived once.
- **AC-3**: A valid access token resolves to exactly one Tally user: the verifier validates the token against Clerk, and the server finds or creates a `users` row keyed on the token's subject, storing the email and refreshing it when it changes at the provider.
- **AC-4**: Every `boards`, `board_items`, and `board_runs` query is scoped to the authenticated user's id, and that id arrives as an **explicit argument** to the repository function. Two signed in users never see or modify each other's boards.
- **AC-5**: Sign in works with **both** Google and GitHub, and the same person using either button resolves to **one** Tally account (no duplicate account, no vanished boards).
- **AC-6**: With `AUTH_MODE=none`, Tally runs as a single user instance with no identity provider configured, using the seeded local user. The server starts in that mode **only** when it is explicitly set; the default is authenticated, and an unset or unrecognised value never yields an open server. **A second, independent guard**: `AUTH_MODE=none` is refused outright when the process looks like production (`NODE_ENV=production`, or a `TALLY_RESOURCE_URL` that is not `localhost` or `127.0.0.1`), so one stray environment variable copied from a local `.env` cannot reopen the public server. That is exactly how the current exposure happened, so a single variable must not be sufficient to cause it again.
- **AC-7**: Per user caps hold on the write paths: a user cannot exceed 25 boards, and a board cannot exceed 200 items. Exceeding either returns a clear tool error naming the limit, and creates nothing.
- **AC-8**: An expired or invalid token produces the AC-1 challenge, **and** the widget renders an explicit reconnect state rather than an empty or silently broken board. The exact wording of the check depends on what the host bridge actually surfaces to widget code on a 401, which is **not yet verified** (today `App.tsx` treats every `callServerTool` rejection identically). Build task 8 establishes the real error shape first; if the host cannot distinguish an auth failure from any other tool error, the fallback is a generic "could not load the board, try reconnecting the connector" state, which still satisfies the intent (never a silently empty board).
- **AC-9**: The migration removes all existing rows and adds `auth_subject` (text, not null, unique), `email` (text, nullable), and `updated_at` to `users`. A fresh deploy starts with no users and creates the first one on first sign in.
- **AC-10**: No access token, and no raw token payload, is ever written to a log. An authentication failure logs a reason (for example "expired", "bad audience", "unknown issuer") and nothing more sensitive.
- **AC-11**: A token that is correctly signed but **not meant for Tally** is rejected with the AC-1 challenge. Specifically: wrong audience (a token minted by the same Clerk instance for a different application or resource), wrong issuer, and an unexpected signing algorithm are each rejected. This is the security property the whole design rests on, and it is **not** provided by the SDK: `requireBearerAuth` checks only scopes and expiry, so the audience, issuer, and algorithm checks live entirely in Tally's own verifier and must be tested directly.

## Decision

**Chosen option**: Option 1, an OAuth 2.1 resource server that delegates identity to Clerk.

Tally implements the MCP authorization spec's resource server role: it publishes a protected resource metadata document, requires a bearer token on `/mcp`, and validates that token against Clerk (the authorization server). Clerk hosts the sign in page, provides Google and GitHub, links both to one identity, and issues the tokens. Tally maps the token's subject to a `users` row and passes that user's id explicitly into every repository call. A `AUTH_MODE=none` escape hatch preserves the current single user behaviour for local development and self hosting.

## Feature design

**Data model sketch** (confirmed with the engineer):

- **`users`** (exists, changes): `id` uuid primary key (**unchanged**, so every existing foreign key keeps working) · **`auth_subject` text not null, unique** (Clerk's stable subject claim; the identity key) · **`email` text, nullable** (from the verified token claims, refreshed when it changes; nullable because a provider need not always supply it) · `created_at` timestamptz (unchanged) · **`updated_at` timestamptz** (new, matching the `boards` convention).
- **`boards`, `board_items`, `board_runs`, `modules`**: **unchanged**. They already carry `user_id` with a cascade delete, which is why this epic is mostly code and barely schema.
- **Deliberately absent**: no sessions table (the transport is stateless; every request carries and revalidates its own token), and no OAuth client table (Clerk is the authorization server, so Tally stores no client registrations).
- **Relationships**: unchanged. `users` 1 to N `boards`; `boards` 1 to N `board_items` and 1 to N `board_runs`. Deleting a user still cascades everything they own.

**State transitions**: a request is `unauthenticated → token presented → verified → mapped to a user`, and any failure short circuits to the 401 challenge. A user row is `created on first sign in → email refreshed on later sign ins`. There is no session state to expire on the server; expiry lives entirely in the token.

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/mcp` | POST | JSON-RPC body, `Authorization: Bearer <token>` | JSON-RPC result or SSE stream | bearer (auth mode); open in `AUTH_MODE=none` | **401** with `WWW-Authenticate` + `resource_metadata` (missing, expired, bad audience, unknown issuer) |
| `/.well-known/oauth-protected-resource` | GET | none | RFC 9728 metadata document (authorization server, resource identifier) | public by design | none |

No other new HTTP surface. Tally hosts **no** OAuth callback: Claude is the OAuth client and Clerk is the authorization server, so the redirect never touches Tally. The existing MCP tool surface (`board_*`) is unchanged in shape; each tool simply operates on the authenticated user's data.

**Key invariants**:
- **There is no ambient user.** `resolveUserId()` is deleted, not modified. Every repository function takes the owner's user id as an explicit argument, so the security boundary is visible at every call site and auditable by reading.
- Every `boards` / `board_items` / `board_runs` query filters by that user id, and every item, status, reset, and ship operation additionally by the current `board_id` (spec 0004, unchanged).
- The access token is never logged, never persisted, and never sent to the widget.
- `AUTH_MODE` defaults to authenticated. Only the exact value `none` disables auth; any unset, empty, or unrecognised value fails closed (start authenticated, or refuse to start), so a misconfiguration can never reproduce today's open server.
- The RFC 8707 resource identifier Tally advertises must exactly equal its public URL, because a token minted for a different audience must be rejected.
- Caps are enforced server side on the write paths, never only in the widget.
- Clerk account linking is enabled, so one person equals one `auth_subject` equals one `users` row.

**Security model**: one role, ownership only. A signed in user may read and write their own boards and nothing else; there is no sharing, no admin role, and no cross user read anywhere in the surface. Tally is a resource server: it never issues tokens, never handles passwords, and never sees credentials. Clerk holds the credentials and the sign in UI.

**Accepted security limits** (named rather than discovered later):
- **Revocation is not instant.** A token stays valid until it expires (about an hour), so signing out or banning a user at Clerk does not immediately cut off an already issued token. Acceptable at this scale, given the data is checklists; introspection on every request would fix it at the cost of a network call per call.
- **The audience, issuer, and algorithm checks are ours alone.** `requireBearerAuth` validates only scopes and expiry, so a mistake in the verifier is not caught by anything else. This is why AC-11 exists and why the verifier is the one piece to test hardest.
- **A changed Clerk subject orphans data.** If someone deletes and recreates their Clerk account they arrive with a new subject and get a fresh, empty Tally account; their old boards are unreachable but not destroyed. Low probability, and no worse than the already accepted lack of self serve deletion.

**Compliance note**: this is the first time Tally stores personal data belonging to other people (email addresses). That undercuts the premise of `foundation.md` §7 #14 ("no standalone `security.md`; low sensitivity personal data"), so that decision needs revisiting (see Follow-up). No regulated category (payment, health, financial) is involved, so no formal compliance regime applies at this scale.

**Configuration required**:
- `AUTH_MODE`: `oauth` (default) or `none`. Anything else fails closed.
- `CLERK_ISSUER_URL`: the Clerk instance that issues and signs tokens; its JWKS endpoint is discovered from this and used to verify signatures.
- `TALLY_RESOURCE_URL`: Tally's canonical public URL, published as the RFC 8707 resource identifier and checked against each token's audience. **Decide and write down whether this includes the `/mcp` path or is the bare origin, because it changes where the metadata document is served** (the SDK appends its pathname). Recommended: the bare origin (`https://tally-production-8b17.up.railway.app`), which keeps the document at the conventional `/.well-known/oauth-protected-resource`. Whichever is chosen, the value must match the deployed URL exactly and be used for both the audience check and the metadata path derivation.
- `CLERK_SECRET_KEY`: only if the build verifies tokens through Clerk's backend SDK rather than by validating the JWT against the published JWKS. Prefer JWKS validation and skip this secret entirely.
- `DEFAULT_USER_ID`: retained, but read **only** when `AUTH_MODE=none`.

**Critical test scenarios** (each maps to an acceptance criterion):
- No token: `POST /mcp` without an `Authorization` header returns 401 carrying the challenge and the metadata URL. Verifies **AC-1**.
- Metadata: fetching `/.well-known/oauth-protected-resource` returns a document naming Clerk and Tally's public URL. Verifies **AC-2**.
- Happy path: a valid token reaches a tool call, and a `users` row exists afterwards with the right subject and email. Verifies **AC-3**.
- Isolation (the one that matters most): two different signed in users each create a board; each sees only their own from every read tool, and neither can mutate the other's items even by passing a known id. Verifies **AC-4**.
- One person, two buttons: sign in with Google, create a board, sign out, sign in with GitHub as the same person, and the same board is there. Verifies **AC-5**.
- Escape hatch: with `AUTH_MODE=none` the server serves tools unauthenticated against the seeded local user; with the variable unset or set to nonsense it does **not** serve unauthenticated. Verifies **AC-6**.
- Caps: creating a 26th board, and a 201st item on a board, each fail with a clear message and create nothing. Verifies **AC-7**.
- Expiry: a token past its expiry produces the 401 challenge, and the widget shows the reconnect state rather than an empty board. Verifies **AC-8**.
- Migration: after migrating, the tables are empty, `auth_subject` is not null and unique, and first sign in creates exactly one user. Verifies **AC-9**.
- Log hygiene: a review of the auth path plus a run with a bad token shows a reason logged and no token material anywhere. Verifies **AC-10**.

## Migration plan

**Strategy**: big bang, which is safe **only** because the engineer chose to start clean and the live dataset is one board holding zero items plus one archived run. There is no data worth a strangler here, and pretending otherwise would be ceremony (the same right sizing judgement spec 0004 applied, reaching the opposite conclusion because that migration had data to protect).

**Phases**:
1. **Clerk setup, before any code ships.** Create the instance, enable Google and GitHub, enable account linking, and confirm **Dynamic Client Registration is on**. Verify DCR first: if Claude cannot register a client, the connector cannot be added at all and everything downstream is blocked.
2. **Schema.** Delete existing rows (one delete on `users` cascades boards, items, and runs), then add `auth_subject` not null unique, `email`, and `updated_at`. Wiping first is what makes the not null column need no backfill.
3. **Code cutover.** Deploy with `AUTH_MODE=oauth`, `CLERK_ISSUER_URL`, and `TALLY_RESOURCE_URL` set. The public URL does not change.
4. **Reconnect.** Remove and re add the connector in Claude so it discovers the metadata document and runs the OAuth flow.

**Rollback**: set `AUTH_MODE=none` and redeploy. This is the useful property of the escape hatch: the schema change is additive and harmless in no auth mode, so rolling back is an environment variable flip rather than a schema revert. **This depends on build task 1 having updated `seed.ts`** to write a sentinel subject; without that fix the seed violates the new not null constraint and the rollback deploy crash loops exactly as the forward one would. Reverting the code commit also works and leaves the columns in place, unused. Note the production guard in AC-6 means a rollback to no auth mode is a **local** remedy; on the public deployment the correct rollback is reverting the code, not disabling authentication.

**Risks**:
- **DCR not enabled at Clerk** blocks connector setup entirely. Mitigated by making it phase 1 and verifying before cutover.
- **Resource identifier mismatch**: if `TALLY_RESOURCE_URL` does not exactly equal the deployed URL, every token fails audience validation and nothing works. Classic and easy to get wrong.
- **Token expiry and refresh** are documented as unreliable in Claude clients (see `rationale.md`): sessions will drop mid conversation. Mitigated, not solved, by requesting the longest available token lifetime and by AC-8's explicit reconnect state.
- **The seed crashing the deploy**: `seed.ts` inserting a user without `auth_subject` violates the new not null constraint, and because the start command chains migrate, seed, and start, the service crash loops instead of starting. Build task 1 fixes the seed in the same task as the migration, and this applies to the rollback path too (a rollback to `AUTH_MODE=none` still runs the seed).
- **`AUTH_MODE=none` reaching production**: a local `.env` copied into Railway, or a stale deploy template, would silently reopen the server exactly as it is open today. This is the closest analogue to the incident that motivated this spec, which is why AC-6 adds a second independent guard rather than trusting one variable.
- **Vendor availability**: if Clerk is down, nobody can authenticate, so Tally is unusable. Accepted at this scale; `AUTH_MODE=none` is the local fallback.

## Build plan

Tracer Bullet (the project default, from specs 0002 to 0004; `AGENTS.md` records no approach). Tasks 1 to 6 are one thin thread: a real token reaching one scoped tool call end to end. Only once that thread is alive does the plan thicken with caps, widget state, and hygiene.

1. **Migration, and fix the seed in the same task.** Delete existing rows, then add `auth_subject` (not null, unique), `email`, and `updated_at` to `users`. Read the generated SQL before applying it, per the spec 0004 discipline. **`src/server/db/seed.ts` must be updated in this same task**: it currently inserts a user with no `auth_subject`, which violates the new not null constraint (and `onConflictDoNothing` does not suppress a not null violation, only a unique one). Because `railway.json` chains `db:migrate && db:seed && start`, a failing seed means the server never starts and the service crash loops. Give the seeded local user a sentinel subject (for example `local-no-auth`) alongside `DEFAULT_USER_ID`. Satisfies **AC-9**.
2. **Clerk setup and configuration.** Instance with Google and GitHub, account linking on, DCR confirmed on; add `AUTH_MODE`, `CLERK_ISSUER_URL`, and `TALLY_RESOURCE_URL` to `env.ts` (validated with Zod, failing closed) and to `.env.example`. Satisfies **AC-5**, **AC-6** (setup).
3. **Token verifier (the security core).** Implement the SDK's `OAuthTokenVerifier` interface (one method, `verifyAccessToken(token)`). Use `jose` (already present transitively at v6.2.4; add it as a direct dependency and record it in `library-docs.md`): `createRemoteJWKSet` for Clerk's key set, then `jwtVerify(token, jwks, { issuer, audience })` with the issuer and audience passed **explicitly** so a token for another application cannot pass. `jose`'s typed API also resists algorithm confusion by default, which a looser library would not. Return `AuthInfo` with the subject and email in its `extra` field (`AuthInfo` has no subject field of its own, so `extra` is where identity rides). Remember the SDK checks only scopes and expiry, so every other check is yours. Satisfies **AC-3**, **AC-11**.
4. **Wire the middleware.** Mount `requireBearerAuth({ verifier, resourceMetadataUrl })` on `/mcp` and `mcpAuthMetadataRouter` for the metadata document, both from the installed SDK (v1.29.0), gated by `AUTH_MODE`. **Derive the metadata path once** from `getOAuthProtectedResourceMetadataUrl(resourceUrl)` and feed that same value to both the middleware and the router, so the path advertised in the challenge cannot drift from the path actually served (the SDK appends the resource URL's pathname, so this differs depending on whether the resource identifier includes `/mcp`). Implement the `AUTH_MODE` gate plus its production guard in `env.ts` with Zod, failing closed. Satisfies **AC-1**, **AC-2**, **AC-6**.
5. **Identity mapping.** Turn `req.auth.extra.sub` into a Tally user: find or create the `users` row by `auth_subject`, refresh `email` when it differs. Make this the single place identity enters the application, and the only place a `UserId` is minted. **In `AUTH_MODE=none` this path is bypassed entirely**: the user id is `env.DEFAULT_USER_ID` directly, with no Clerk lookup and no subject mapping, which is why the seeded sentinel row from task 1 must exist. Satisfies **AC-3**, **AC-5**.
6. **Thread the user id explicitly, with a type the compiler can police.** Change every function in `src/server/modules/board/repo.ts` to take the owner's user id as an argument, update every call site in the tool layer, and **delete `resolveUserId()` and `src/server/user.ts`** so no ambient fallback can survive (a missed call site then fails to compile rather than silently reading the wrong user). Deletion alone does not catch a **transposed** argument: `editItem(userId, id, title)` is three plain strings, so passing them in the wrong order compiles cleanly and quietly defeats AC-4. Prevent that structurally with a branded type (`type UserId = string & { readonly __brand: unique symbol }`, minted only by the identity mapping in task 5) or by switching these functions to a single options object (`{ userId, id, title }`). Satisfies **AC-4**.
7. **Caps.** Named constants (25 boards per user, 200 items per board) enforced on the create paths, returning a clear error that names the limit. The count then insert check is **racy by nature**: two concurrent calls can both read a count under the limit and both insert. Accepted as bounded overshoot, because these caps exist for cost control rather than as a hard invariant, and tool calls from one conversation are effectively sequential. If it ever matters, close it with a per user `pg_advisory_xact_lock` around the check and insert, the same race safe pattern `currentBoard()` already uses. Satisfies **AC-7**.
8. **Widget session expired state, error shape first.** Before building the UI, establish empirically (in Claude Desktop) what a 401 actually looks like to widget code: today `App.tsx` catches every `callServerTool` rejection identically, and whether the MCP Apps host bridge distinguishes an auth failure is a host side detail this spec has **not** verified. Build the state around the observed shape, falling back to the generic reconnect message if the host cannot distinguish it. Satisfies **AC-8**.
9. **Log hygiene.** Log an auth failure reason and never token material; review the whole auth path for accidental logging. Satisfies **AC-10**.
10. **Verify.** Run the scenarios above: the two user isolation test is the one that must not be skipped, since it is the actual security claim.

## Consequences

**Positive**:
- The owner's data becomes private, and the current situation (strangers sharing one board on a public URL) ends.
- Tally becomes genuinely multi user: a visitor can try it properly, with their own boards, which is what a portfolio demo needs.
- The account seam `foundation.md` §7 #6 was designed around becomes real, and the §10 scale seam is consumed exactly as predicted.
- Explicit identity threading makes the security boundary visible at every call site, which is stronger than the previous implicit arrangement and matches §4 #1 (explicit over magic).
- Tally never handles a password or renders a sign in page, so the largest classes of auth bugs stay outside the codebase.

**Negative / tradeoffs**:
- **Everyday reliability drops for the owner.** Today Tally always works; afterwards sessions expire and Claude clients refresh tokens unreliably, so mid conversation failures become a normal event. This is the real price of the change.
- The demo gains friction: a visitor must complete a sign in before seeing anything, where today the board appears immediately.
- A vendor enters the critical path. Clerk down means nobody can authenticate.
- Roughly twenty repository signatures and all their call sites change in one pass.
- Tally holds other people's personal data (emails) for the first time, with the obligations that implies.
- The existing archived run is destroyed by the migration (the engineer's explicit choice, made when the board already held zero items).
- The seam's original promise ("change only this function") proves false: identity cannot come from a zero argument function reading a module constant. The scoping discipline was right; the mechanism was optimistic.

**Neutral**:
- `foundation.md` §7 #6 is superseded by this decision and the authority needs updating (Follow-up).
- No self serve account deletion in this slice; the README documents a manual path instead.
- The widget needs no auth of its own: MCP Apps tool calls inherit the conversation's authentication, so the sandboxed iframe is unaffected.
- Per user caps arrive as a side effect of going public; they are not an auth requirement as such.

## Follow-up

- [ ] Update `foundation.md` to v7 on acceptance: §7 #6 (single tenant, no auth) is **superseded** by this spec, §8 moves auth out of "Out / cut", §10's first scale seam is consumed, and a new §7 decision records the resource server plus Clerk model.
- [ ] Revisit `foundation.md` §7 #14 (no standalone `security.md`). Its premise was low sensitivity personal data with no tokens; Tally now holds other people's emails and handles access tokens, so a dedicated security file may now be warranted. `context/code-standards.md` §9 says the same thing in its own words ("revisit if the project goes multi tenant"), which this triggers.
- [ ] **Update `context/code-standards.md` §5**, which currently states as law that `user_id` comes from one resolver (`resolveUserId()`) and never from tool arguments. This spec deliberately reverses that rule, and `code-standards.md` is read top to bottom every session, so leaving it contradicting the shipped code is worse than an ordinary stale doc.
- [ ] Decide what the `modules` registry row means per user. Today one row exists for the seeded user; nothing creates one for a newly signed in user. No runtime code reads the table, so nothing breaks, but it quietly stops being the accurate per user registry `foundation.md` §9 frames it as.
- [ ] Add self serve account and data deletion (deferred here). Until it exists, document the manual deletion path in the README.
- [ ] Update the README: sign in is now required on the hosted instance, which sign in methods exist, and how to self host with `AUTH_MODE=none`.
- [x] ~~Verify Clerk's Dynamic Client Registration toggle is on before cutover~~ **Done 2026-07-25**: DCR is enabled and `registration_endpoint` is live at `https://powerful-manatee-12.clerk.accounts.dev/oauth/register`. Google and GitHub are enabled, default scopes are `openid, profile, email`, `verify_at_sign_up` is true (which is what makes account linking automatic), and access tokens are JWTs (`oauth_jwt_access_tokens: true`), confirming the JWKS validation design needs no Clerk secret.
- [x] ~~Confirm whether a development instance is acceptable for the deployed service~~ **Decided 2026-07-25: ship on the Clerk development instance**, deliberately. It is technically fine (Clerk's OAuth endpoints are public and reachable from the deployed service), it costs nothing, and the 100 user cap is far beyond a portfolio demo's needs. **Accepted costs**, recorded so they are not a surprise: the sign in consent screen shows an `accounts.dev` domain rather than Tally branding (Clerk uses shared OAuth credentials in development); the instance is capped at **100 users**; and Clerk states **user data cannot be transferred between instances**, so moving to a production instance later changes every `auth_subject` and orphans every account and its boards. **Revisit when** any of these becomes true: sign ups approach 100, the unbranded consent screen starts to matter for the portfolio, or Tally is treated as a real service rather than a demo. Going production requires a domain you own (roughly $12 a year), which would also let the deployment leave the `railway.app` subdomain.
- [ ] **Open: what the access token's `aud` claim actually contains.** Clerk advertises `aud` in `claims_supported` but documents nothing about RFC 8707 resource indicators, so whether a token is bound to Tally's resource URL is unverified. Decide it empirically in build task 3 by decoding a real token: if `aud` carries the resource URL, keep the strict audience check (AC-11); if not, keep this Clerk instance dedicated to Tally alone and verify strictly on issuer, recording the weaker guarantee in the security model.
- [ ] `context/build-graph.md` is stale (it still describes the pre 0004 `launch_*` world and lists the Railway deploy as pending) and every node in it is now built. Refresh it so the plan reflects reality.
- [ ] Consider HTTP rate limiting per identity as a second layer; caps limit stored rows but not request volume.
- [ ] Revisit token lifetime once real usage shows how often expiry actually bites.

## Rationale

Reasoning, the options, the landscape scan, and references live in `rationale.md`.
