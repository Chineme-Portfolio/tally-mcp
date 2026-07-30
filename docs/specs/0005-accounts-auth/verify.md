# Verify: accounts and authentication · spec 0005 · updated 2026-07-25

_Steps derived from spec 0005 acceptance criteria. `/check verify` runs these; `/test` locks the durable server side ones. The Commands section already passes (see `progress-log.md`); **everything in UI / manual needs the deploy plus a real Clerk sign in**, so it is the outstanding half._

## Commands

- [x] `npm run typecheck` → no errors → supports all
- [x] `npm run db:migrate` → `users` has `auth_subject` (text, not null, unique), `email` (nullable), `updated_at`; all tables empty afterwards → **AC-9**
- [x] `npm run db:seed` with `AUTH_MODE=none` → writes one user with `auth_subject = local-no-auth` and does **not** throw (this is the crash loop that would otherwise take the whole deploy down) → **AC-9**, **AC-6**
- [x] `npm run db:seed` with auth on → seeds nothing, logs that accounts are created on first sign in → **AC-9**
- [x] `npm run build:widget` → `dist/widget/index.html` is one self contained file → **AC-8** (setup)
- [x] Auth on, no token: `POST /mcp` → **401** with `WWW-Authenticate: Bearer ... resource_metadata="..."` → **AC-1**
- [x] `GET` the protected resource document at the path the challenge advertises → RFC 9728 JSON naming Clerk as the authorization server and Tally as the resource → **AC-2**
- [x] Auth on, garbage token (`Authorization: Bearer not-a-real-token`) → **401** (not 500), reason `ERR_JWS_INVALID` → **AC-11**
- [x] Auth on, **forged JWT** with the correct `iss`, `aud`, and `sub` but signed with the wrong key → **401**, reason `ERR_JWKS_NO_MATCHING_KEY`. This is the real attack: correct looking claims must not survive a bad signature → **AC-11**
- [x] Config guards, each must refuse to start: `AUTH_MODE=none` with a non localhost `TALLY_RESOURCE_URL`; `AUTH_MODE=none` with `RAILWAY_ENVIRONMENT` set; auth on without `CLERK_ISSUER_URL`; auth on without `TALLY_RESOURCE_URL` → **AC-6**
- [x] Fail closed: `AUTH_MODE=non` (a typo) resolves to **auth ON**, never off → **AC-6**
- [x] `AUTH_MODE=none` regression: board read, add, and the tab set all still work after the identity threading → **AC-4** (supports)
- [ ] Server logs on a rejected token show a reason only (`ERR_*`), and **no token, claim, or payload** anywhere in the output → **AC-10**
- [ ] Code review: every query in `repo.ts` filters by the `userId` argument; no ambient user exists (`src/server/user.ts` and `resolveUserId()` are deleted); `UserId` is branded and minted only in `auth/identity.ts` → **AC-4**, **AC-10**

## UI / manual
_All of these need the deployed service with auth on, plus the connector added in Claude. Remove and re add the connector so it discovers the metadata document and runs the OAuth flow._

- [ ] Add the custom connector → Claude registers dynamically and opens Clerk's sign in → completing it returns you to a working board → **AC-3**
- [ ] After first sign in, a `users` row exists with the Clerk subject and your email → **AC-3**
- [ ] Sign in with **Google**, create a board, sign out, sign in with **GitHub** as the same person → the same board is there (one account, not two) → **AC-5**
- [ ] **The isolation test, do not skip it, it is the actual security claim**: two different accounts each create a board; each sees only their own from every read tool; neither can mutate the other's items even when passing a known item id → **AC-4**
- [ ] Create boards up to the limit → the 26th returns a clear error naming the limit and creates nothing; likewise a 201st item on one board → **AC-7**
- [ ] Let a token expire (or revoke the session at Clerk) → the widget shows the **"Session expired, reconnect"** banner rather than an empty board → **AC-8**
- [ ] While there, capture what the host bridge actually reports on a 401, and tighten `looksLikeAuthFailure()` in `App.tsx` if the real shape is more specific than the text sniffing fallback → **AC-8**
- [ ] Decode a real access token and inspect its **`aud` claim**. If it carries Tally's resource URL, the strict audience check stands. If it does not, relax to a dedicated Clerk instance plus strict issuer checking and record the weaker guarantee in the spec's security model → **AC-11**
- [ ] Ask Claude to ship a board and read history → both still behave as spec 0003 and 0004 define, now scoped to your account → **AC-4** (supports)

## Acceptance-criteria coverage
- AC-1 → commands 6 · AC-2 → commands 7 · AC-3 → manual 1, 2 · AC-4 → commands 12, 14 + manual 4 (the isolation test is the load bearing one) · AC-5 → manual 3 · AC-6 → commands 3, 10, 11 · AC-7 → manual 5 · AC-8 → commands 5 + manual 6, 7 · AC-9 → commands 2, 3, 4 · AC-10 → commands 13, 14 · AC-11 → commands 8, 9 + manual 8 (the `aud` question)
