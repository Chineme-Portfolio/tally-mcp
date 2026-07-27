# 0005. Accounts and authentication — rationale

The decision record for `index.md`. Reasoning, options, the landscape scan, and references; `/develop` builds from `index.md`, not this file.

## Context

> ⚠️ Premise note: adding authentication makes Tally **less** reliable for the owner day to day, not more. Today it always works. Afterwards, access tokens expire after roughly an hour and Claude clients are reported to refresh them unreliably, with Desktop sometimes losing a token on restart while still displaying "connected". So this trades everyday reliability for privacy and multi user correctness. That is the right trade when the alternative is strangers sharing your board on a public URL, but it is a real cost, and it is part of why the `AUTH_MODE=none` escape hatch exists: a local instance keeps the old, always works behaviour. A second, smaller note: authentication makes the portfolio demo **harder** to try, not easier. Today a visitor connects and sees a board instantly; afterwards they must complete a sign in first. The change is still correct, because what they currently see is the owner's private data, but nobody should expect it to smooth the demo path.

Tally is deployed at a public URL with no authentication at all. It was built single tenant by deliberate decision (`foundation.md` §7 #6): `user_id` exists on every table from day one, but nothing enforces who a request belongs to, because `resolveUserId()` returns a fixed value from the environment. That was the right call while the server ran locally for one person. Deploying it publicly changed the facts without changing the code: every visitor who adds the connector is served as the same user, so a recruiter following the portfolio link lands on the owner's real board, can read it, and can delete it.

There are two problems tangled together here, and they may or may not have the same answer. The first is privacy: the owner's data should be theirs. The second is product: a portfolio piece exists to be tried, so a stranger should be able to use the hosted instance without colliding with anyone. Solving only the first (lock it down) is far cheaper but kills the demo. Solving both means real accounts.

Three forces constrain the answer. **The client is not a browser.** Tally is reached by Claude Desktop and claude.ai as a remote MCP connector, so whatever authentication exists must be something those clients can actually perform; ordinary web session patterns are irrelevant. **The transport is stateless.** A fresh MCP server is built per request with no session, so identity has to be resolved from the request itself every single time, with nowhere to cache it. **The builder is one person at about ten hours a week**, comfortable reading TypeScript rather than writing it fluently, on effectively no budget. An approach that is theoretically superior but takes a month of evenings to operate is not superior here.

One inherited claim needed checking rather than trusting. `src/server/user.ts` promises that going multi tenant means changing "only this function", because every query is already scoped by its return value. The first half is true and valuable: every query in `repo.ts` really is scoped, with no unscoped read anywhere. The second half is not, and it matters: `resolveUserId()` takes no arguments and reads a module level constant, so it cannot return a per request identity as written. Something must carry the authenticated principal from the request into the data layer, and choosing what is a real decision this spec owns.

## Options considered

### Option 1: OAuth 2.1 resource server, identity delegated to Clerk (chosen)

Tally implements the resource server half of the MCP authorization spec: it publishes a protected resource metadata document, demands a bearer token, and validates that token against Clerk, which hosts the sign in page, offers Google and GitHub, and issues the tokens.

**Pros**:
- The only option that actually delivers multi user on the real clients (see the landscape scan: claude.ai connectors support OAuth and nothing else).
- Almost all the protocol work is already in the installed SDK (`requireBearerAuth`, `mcpAuthMetadataRouter`), so the build is a token verifier plus an identity mapping, not an OAuth implementation.
- No password, no sign in UI, and no credential storage ever enters the codebase, which removes whole classes of security bugs.
- Clerk's hosted page is themeable, so the sign in screen can wear Tally's brand without a web frontend existing.

**Cons**:
- The largest build of the options, and it puts a vendor in the critical path.
- Inherits the ecosystem's token refresh weaknesses, so mid conversation session failures become normal.
- Adds a sign in step before a visitor sees anything.

### Option 2: A secret in the endpoint URL

Give the server a hard to guess path (for example `/mcp/<long-random-string>`) and treat knowledge of that URL as the credential. Works with any client, because it is just a URL.

**Pros**:
- Genuinely cheap: an afternoon, no provider, no schema change, no vendor.
- Immediately solves the privacy half of the problem.
- Sidesteps the entire OAuth landscape and its refresh problems, keeping today's reliability.

**Cons**:
- Single shared secret, so it is one user only. It does not solve the product half at all, and self hosting becomes the only story for anyone else.
- A credential in a URL is a known antipattern: URLs leak into logs, proxies, and screenshots far more readily than headers, and rotating it breaks every existing connector.
- For a portfolio piece, shipping a deliberately weak authentication scheme is itself a poor signal.

### Option 3: Self hosted authorization server (Ory or Keycloak)

Run the identity provider too, on Railway alongside Tally, giving full control over the flow and the sign in UI.

**Pros**:
- No vendor dependency and no free tier ceiling; the whole stack stays owned and portable.
- Complete control of the sign in experience, including a fully custom UI.

**Cons**:
- Another service to deploy, patch, monitor, and keep alive, which is exactly the operational cost a solo builder at ten hours a week should refuse.
- Setup is substantially steeper than a hosted provider for an identical outcome from the user's point of view.
- The identity provider is not the interesting part of this project; owning it spends the scarcest resource (time) on the least differentiated component.

### Option 4: Per user static tokens in a custom header

Issue each user an API key and have them paste it into the connector configuration, resolving identity from a header on each request. Conceptually the cheapest route to real multi user.

**Pros**:
- Trivial to implement and to reason about, with no OAuth machinery and no provider.
- Stateless by nature, which suits the transport perfectly, and tokens need not expire, avoiding the refresh problem entirely.

**Cons**:
- **Not possible today.** claude.ai custom connectors expose OAuth client credentials only; there is no supported way to set a static bearer token or a custom header. The option fails on client support before its merits matter.
- Even if supported, it would put long lived credentials in users' hands with a manual issuance and revocation process to build.

## Rationale

Option 4 is eliminated by fact rather than judgement, and it is worth stating plainly because it was the attractive answer going in: it is the cheapest path to real multi user, it suits a stateless transport perfectly, and it sidesteps every token refresh problem. The landscape check killed it. claude.ai custom connectors accept OAuth and nothing else, so a static per user token cannot reach the server no matter how well designed. This is the single finding that most shaped the decision, and it is why checking the landscape mattered more than reasoning from first principles.

Option 2 is the honest cheap answer and deserves more respect than it usually gets: it solves the urgent problem (the owner's data is exposed right now) in an afternoon. It was rejected because it solves only half the stated problem. Context names two goals, privacy and a tryable demo, and a single shared secret cannot produce a second user by construction. There is also a signalling cost specific to this project: Tally exists partly to demonstrate competence, and shipping a credential in a URL demonstrates the opposite.

Option 3 fails on the operational reality force from Context rather than on capability. It would work, and it is the most sovereign choice. But it adds a second production service for a solo builder at about ten hours a week, and it buys control over the one component nobody will evaluate this project on. When the constraint is time rather than money or control, a managed provider is the correct trade.

That leaves Option 1, and the force that makes it affordable is that most of it already exists. Verifying the installed SDK directly rather than assuming showed it ships `requireBearerAuth`, `mcpAuthMetadataRouter`, and `getOAuthProtectedResourceMetadataUrl`, which means the specification's mandatory parts (the metadata document, the `WWW-Authenticate` challenge, audience binding) are wiring rather than implementation. What remains is one interface method to satisfy and a find or create mapping from a token subject to a user row. That is a weekend or two, not a month, and it is what moves this from "an epic in disguise" to a tractable slice.

Two secondary calls deserve their reasoning recorded. **Explicit identity threading over `AsyncLocalStorage`** costs a one time pass over roughly twenty function signatures, and buys a security boundary you can verify by reading: at every call site it is visible which user's data is being touched. Request scoped storage would have preserved the original seam's promise with a far smaller diff, but it makes identity arrive invisibly, which is precisely the magic `foundation.md` §4 #1 rejects, and for a boundary whose whole job is to be correct, visible beats convenient. **Clerk over Supabase** came down to risk rather than features: both offer a free tier and Dynamic Client Registration, and Supabase had the advantage of already being familiar, but its OAuth server is still beta, and beta software underneath authentication is a bad place to economise. Clerk also themes its hosted sign in page, which matters here because Tally has no web frontend of its own and never will as part of this spec.

## Landscape scan (2026-07-25)

Findings from a capped web check, run once during the design conversation. Recorded because several of them changed the decision.

- **The MCP authorization model** (specification revision 2025-11-25): the MCP server acts as an OAuth 2.1 **resource server**, never an authorization server. It must publish OAuth 2.0 Protected Resource Metadata (RFC 9728) at `/.well-known/oauth-protected-resource`, must answer unauthorised requests with 401 plus a `WWW-Authenticate: Bearer` header carrying the `resource_metadata` URL, and must validate that a token's audience is this specific server (RFC 8707). Clients must use PKCE. Client registration prefers preregistration, then Client ID Metadata Documents, then Dynamic Client Registration (RFC 7591), which is optional in the specification but relied on in practice.
- **Claude client support**: claude.ai custom connectors support OAuth **only**, exposing an OAuth client id and secret. There is no documented support for static bearer tokens, API keys, or custom headers, which eliminates Option 4. Community reports request this and remain unanswered; treated as unavailable rather than merely undocumented.
- **SDK support**: verified directly against the installed `@modelcontextprotocol/sdk` v1.29.0 rather than from the web, since the scan was uncertain. It ships `server/auth/middleware/bearerAuth` (`requireBearerAuth({ verifier, requiredScopes, resourceMetadataUrl })`, which attaches `req.auth` and emits the challenge), `server/auth/router` (`mcpAuthRouter`, `mcpAuthMetadataRouter`, `createOAuthMetadata`, `getOAuthProtectedResourceMetadataUrl`), and `ProxyOAuthServerProvider`. `OAuthTokenVerifier` is a single method, `verifyAccessToken(token): Promise<AuthInfo>`. Notably `AuthInfo` carries `token`, `clientId`, `scopes`, `expiresAt`, `resource`, and `extra`, but **no subject field**, so the user identity must ride in `extra`.
- **Provider comparison**: Clerk (free to 50k monthly active users, DCR available as a dashboard setting, strong documentation, themeable hosted pages), Supabase (free tier, DCR available, OAuth server still beta), Ory or Keycloak (free and self hosted, high operational cost), Auth0 (DCR gated behind an enterprise plan, so effectively unavailable for this use case).
- **Known gotchas**: access tokens expire in about an hour and are not reliably refreshed mid conversation, so tool calls can fail part way through; the `resource` parameter is sometimes dropped on refresh, breaking audience validation; Claude Desktop can lose a token across restarts while still showing the connector as connected. **MCP Apps widgets inherit the parent conversation's authentication**, so a sandboxed iframe needs no separate token flow, which settles the concern raised when this design opened.
- **Confidence**: the specification requirements and the OAuth only constraint on claude.ai connectors are the best supported findings. Exact token refresh behaviour is the least certain and may differ between Desktop and claude.ai; the design does not depend on it beyond assuming it is unreliable, which is the safe assumption.

## Cross check (2026-07-25)

A read only critique on a second model, which read the SDK source and the repository rather than trusting this spec. Verdict: sound after fixes, no blocker. Every finding was applied. The load bearing ones, recorded because they changed the design:

- **`requireBearerAuth` does not check the token audience.** Confirmed in the SDK source: the middleware validates only `requiredScopes` and `expiresAt`. So audience, issuer, and algorithm validation live entirely in Tally's own verifier with no backstop, and the original draft had no test scenario covering a wrong audience token. A token minted by the same Clerk instance for a different application would have been accepted. Fixed by adding **AC-11**, naming `jose` with an explicit `{ issuer, audience }` in build task 3, and recording the limit in the security model.
- **The seed would have crashed every deploy.** `seed.ts` inserts a user with no `auth_subject`; once that column is not null the insert throws, and `onConflictDoNothing` does not suppress a not null violation. Because `railway.json` chains migrate, seed, and start, the service would crash loop on the first deploy carrying the new schema, and again on the documented rollback. Fixed by folding the seed update into build task 1 and correcting the rollback text, which had asserted in the present tense that the seed already wrote a sentinel.
- **The metadata document path depends on the resource URL's pathname.** `mcpAuthMetadataRouter` serves at `/.well-known/oauth-protected-resource` plus the resource URL's path, so a resource identifier including `/mcp` moves the document and would break discovery for every user. Fixed by deriving the path once from `getOAuthProtectedResourceMetadataUrl()` and pinning the configuration choice.
- **One environment variable was the only thing holding auth on.** Since the current exposure happened by deploying without auth, a stray `AUTH_MODE=none` copied from a local `.env` would reproduce it exactly. Fixed by adding an independent production guard to AC-6, which in turn makes the production rollback "revert the code", not "disable auth".
- **Explicit threading is compiler visible to a missed call site but not to a transposed argument.** `editItem(userId, id, title)` is three plain strings. Fixed by requiring a branded `UserId` type or an options object in build task 6.
- **AC-8 assumed a host capability that was never verified.** The widget currently treats every tool call rejection identically, and whether the host bridge distinguishes a 401 is unknown. Fixed by making build task 8 establish the real error shape first, with a generic fallback that still satisfies the intent.
- Smaller items applied: the caps race is named as accepted bounded overshoot (with the advisory lock remedy noted), revocation lag and Clerk subject changes are recorded as accepted limits, the `AUTH_MODE=none` identity path is specified explicitly, and `code-standards.md` §5 plus the `modules` registry row were added to Follow up.

## References

**Project sources** (verifiable, in this repo):
- `foundation.md` §7 #6 (single tenant, no auth, `user_id` from day one, the decision this supersedes), §10 (the scale seam that named OAuth as the replacement), §4 #1 (explicit over magic, which decided the identity threading), §7 #14 (no standalone `security.md`, whose premise this change undercuts), §0 (solo builder, about ten hours a week, near zero budget).
- `src/server/user.ts` (the `resolveUserId()` seam and its claim, checked rather than trusted) and `src/server/modules/board/repo.ts` (every query scoped by that value, confirming the discipline half of the claim).
- `src/server/index.ts` and `src/server/mcp.ts` (the stateless transport: a fresh server per request, `sessionIdGenerator: undefined`).
- `docs/specs/0004-board-model/index.md` (the board model this scopes, and the migration discipline of reading generated SQL before applying it).
- `context/code-standards.md` §5 (scoping as the security boundary) and §9 (nothing secret in the widget bundle).
- The installed `@modelcontextprotocol/sdk` v1.29.0 type definitions, read directly to confirm the auth exports and the shape of `AuthInfo`.

**Practices & standards**:
- OAuth 2.1 resource server separation: the application validates tokens and never issues them or handles credentials.
- Fail closed configuration: an unset or unrecognised `AUTH_MODE` must never yield an open server.
- Never place a credential in a URL, because URLs leak through logs, proxies, and screenshots far more readily than headers.
- Do not build authentication yourself when a proven provider fits; the failure modes (token expiry, refresh rotation, secure storage, session fixation) are each a potential breach.
- Right size the migration to the real blast radius, the same judgement spec 0004 applied to reach the opposite conclusion.

**Links** (web verified during the design conversation; not fetched again):
- MCP authorization specification (revision 2025-11-25): https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization
- RFC 9728, OAuth 2.0 Protected Resource Metadata: https://datatracker.ietf.org/doc/html/rfc9728
- RFC 8707, Resource Indicators for OAuth 2.0: https://www.rfc-editor.org/rfc/rfc8707.html
- Getting started with custom connectors using remote MCP: https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp
- How Clerk implements OAuth (including dynamic client registration): https://clerk.com/docs/guides/configure/auth-strategies/oauth/how-clerk-implements-oauth
- Supabase OAuth server: https://supabase.com/docs/guides/auth/oauth-server
- Auth0 dynamic client registration (enterprise gated): https://auth0.com/docs/get-started/applications/dynamic-client-registration
