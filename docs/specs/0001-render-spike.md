# 0001. Render spike: prove the ui:// widget pipeline end to end

**Date**: 2026-07-22
**Status**: In Progress

## Summary

Before building any real feature, prove that a widget produced by our own MCP server actually renders inside Claude, and that a button in that widget can call a server tool and change state. This spike stands up the smallest possible thread through every layer (an MCP server, a `ui://` widget resource, a React widget bundled into one file, a read tool the widget calls on mount, and an app only write tool the button calls). It uses no database and neutral styling on purpose, so the only thing under test is the rendering pipeline. If it renders and the round trip works, the project's deepest risk is retired and the launch board can be built with confidence.

## Context

The whole product bets on one external fact: that an MCP Apps widget our server returns will render inline in Claude (`foundation.md` §11, the deepest risk). The MCP Apps extension is about six months old. Third party widgets have been seen to render in both Claude Desktop and claude.ai, but our own pipeline (a tool links a `ui://` resource, the resource is one self contained HTML file built by `vite-singlefile`, the widget talks back over the app bridge) has never been run. A misconfigured resource link, a wrong content type, a bundle that is not truly self contained, or a transport that rejects the client can each make the widget silently fail to appear.

The forces at play: the portfolio value collapses if the widget does not render where the demo happens; this is a first MCP server, so the pipeline is unfamiliar; the builder has about 10 hours a week, so a fast inner loop matters; and the extension's API is new, so a few exact values are not yet confirmed from the docs. The cost of not doing this first is discovering a rendering problem only after sinking feature time into tools and persistence, which `foundation.md` §7 #15 explicitly guards against.

## Requirements

**User stories**:
- As the builder, I want to confirm that a widget my own server produces renders inside Claude Desktop, so I know the MCP Apps pipeline works before I build features.
- As the builder, I want a button in that widget to call a server tool and change state, so I know the widget to server round trip (half of my keystone) works.

**Acceptance criteria**:
- **AC-1**: Invoking the render tool (`spike_show`) in Claude Desktop displays the widget inline as UI, not as raw text or JSON.
- **AC-2**: On mount, the widget calls the read tool `spike_state` through the app bridge and displays the `count` value returned by the server (proves the pull model initial data path indicated for `@modelcontextprotocol/ext-apps` v1.1.2).
- **AC-3**: Clicking the widget's button calls the `spike_ping` tool and the displayed `count` increments by one on each click, monotonically across at least two clicks (proves the widget to server round trip actually changes server state, not just repaints).
- **AC-4**: The server logs each tool call, so the round trip is observable on the server side.
- **AC-5**: The same server, deployed to Railway and reached at its public URL, renders the widget in Claude Desktop and the round trip works (proves the deployed path, not only the local tunnel).
- **AC-6**: `spike_ping` is app only: it is not offered to the model as a callable tool, so Claude cannot invoke it directly in conversation; only the widget can (proves the host's app only visibility enforcement, the mechanic the portfolio hinges on).

## Options considered

### Option 1: Render only spike (no round trip)

Stand up the server and a `ui://` widget, confirm only that it renders. Nothing calls back.

**Pros**:
- Smallest possible amount of work; fastest to a first render.

**Cons**:
- Leaves half the keystone (the widget calling a tool) unproven, so the second, subtler risk (the app bridge) surfaces only later, mixed in with real feature code.

### Option 2: Render plus one round trip (chosen)

The widget renders, fetches its initial value by calling a read tool on mount, and has one button that calls an app only write tool and updates. Iterated with a local tunnel, then one Railway deploy to confirm the production path. Widget rebuilt by watching and rebuilding the single file.

**Pros**:
- Proves both halves of the keystone (render, and widget calls tool) for little extra cost.
- Exercises the pull model and the app only visibility path early, in isolation.

**Cons**:
- Slightly more work than render only; the app bridge and two tools must be wired.

### Option 3: Skip the spike, build the launch module directly

Go straight to the real `launch_*` tools, schema, and widget.

**Pros**:
- No throwaway code.

**Cons**:
- Any rendering or bridge problem is discovered after feature time is spent, entangled with persistence and CRUD; this is the exact failure `foundation.md` §7 #15 exists to prevent.

## Decision

**Chosen option**: Option 2: render plus one round trip.

Build the thinnest end to end thread (an MCP server over streamable HTTP, a `ui://` widget resource, a `vite-singlefile` React widget, a read tool the widget calls on mount, and one app only write tool the button calls), iterate against Claude Desktop through a local tunnel, then deploy once to Railway to confirm the production path. The widget is rebuilt by watching and rebuilding the single HTML file, so development matches production exactly.

## Rationale

The round trip is worth the small extra cost because it retires the app bridge risk in isolation now, rather than tangled into launch board code later; and because the design time API check against v1.1.2 indicates a pull model (the widget fetches its data on mount via `callServerTool`), so a widget that fetches on mount is the natural shape anyway, not extra scaffolding. Skipping the spike (Option 3) directly contradicts the deepest risk mitigation in Context. The local tunnel keeps the inner loop fast, which matters at 10 hours a week, while one Railway deploy still proves the deployed path the v1 milestone requires (`foundation.md` §3). Watching and rebuilding the single file (over a Vite dev server behind the resource) avoids any development versus production difference, which is the safer default on a first build where an unfamiliar failure is hard enough to diagnose without a dev only code path in the mix.

Two tools, not one, back the round trip on purpose. `spike_state` (read, model + app) serves the mount fetch, so the first ever bridge call is a plain read and an AC-2 failure clearly means the pull model is wrong. `spike_ping` (write, app only, `visibility: ["app"]`) serves the button, so the app only enforcement path is exercised and, per AC-6, actually checked (the model must not see it). Splitting them keeps a mount failure and a visibility failure from looking alike, and it mirrors the real launch module's read versus write split (`foundation.md` §7 #10 to #11).

## Feature design

**Data model sketch**:
No persistence. The spike holds one integer in the server process (`count`), read by `spike_state` and incremented by `spike_ping`. It resets when the server restarts, which is fine for a spike. Postgres, Drizzle, and the `users`/`modules`/`items` schema are not part of this spike; they are separate Layer 0 work (`build-graph.md`), deliberately excluded here to isolate the render risk (the build graph is a dependency map, not a timeline, so "separate" does not mean "strictly after").

**State transitions**: none (a counter, not a state machine).

**API surface** (MCP methods over JSON-RPC, not HTTP verbs):

| Tool or resource | MCP method | Key inputs | Key outputs | Visibility | Key errors |
|---|---|---|---|---|---|
| `spike_show` | tools/call | none | reference to the `ui://spike/app.html` resource, plus a small hello payload | model + app | resource not found if the `ui://` is unregistered |
| `spike_state` | tools/call | `{}` (empty) | `{ count }`, server computed | model + app | none expected |
| `spike_ping` | tools/call | `{}` (empty) | `{ count, at }`, `count` incremented | **app** (`["app"]`) | none expected |
| `ui://spike/app.html` | resources/read | the uri | the single file HTML widget | (resource) | resource not found |

**Key invariants**:
- The `ui://` HTML is one self contained file: no external `<script src>` or `<link>`, everything inlined by `vite-singlefile` (`code-standards.md` §4).
- No secret ships in the widget bundle (`code-standards.md` §9).
- Every tool sets `visibility` explicitly: `spike_show` and `spike_state` are model + app, `spike_ping` is app only (`README.md` non negotiable #3).

**Security model**:
No auth, no user data, single process. No regulated data, so no compliance scope. The MCP server has no secrets in this slice; the tunnel and Railway URLs are not secrets but are not committed. Note: the streamable HTTP transport in recent SDK versions may enforce origin or host allow lists (DNS rebinding protection); this must be configured so Claude Desktop is not rejected (see Configuration and build task 2).

**Configuration required**:
- `PORT`: the port the MCP HTTP server listens on (default to a fixed local port).
- Transport security settings for the streamable HTTP transport (allowed hosts / allowed origins), set so the client is accepted; exact keys are UNCONFIRMED (see Follow-up).
- Note (client side, not server env): Claude Desktop's MCP servers config must point at the server's public MCP endpoint URL, the tunnel URL while iterating, then the Railway URL to satisfy AC-5.

**Critical test scenarios** (each maps to an acceptance criterion):
- Happy path: call `spike_show` in Claude Desktop, the widget renders inline and, on mount, shows `count` fetched from `spike_state`. Verifies **AC-1**, **AC-2**.
- Round trip: click the widget button two or more times, `spike_ping` runs each time, the displayed `count` increments by one each click, and a log line appears on the server per call. Verifies **AC-3**, **AC-4**.
- App only enforcement: in conversation, confirm Claude is not offered `spike_ping` and cannot call it directly (only the widget can). Verifies **AC-6**.
- Deployed path: after deploying to Railway and pointing Claude Desktop at the Railway URL, the widget renders and the round trip works. A redeploy resets the in memory `count`, so a value returning to zero right after a deploy is expected, not a broken round trip. Verifies **AC-5**.
- Auth or permission: not applicable this slice (no auth), stated so it is not silently skipped.

## Build plan

Ordered as a Tracer Bullet: stand up a working thread through every layer, then thicken it, then prove the deployed path. Build approach was not recorded in `AGENTS.md`; Tracer Bullet is assumed as the default for this thin vertical slice.

1. Scaffold the single package skeleton: `package.json`, strict `tsconfig.json`, the `src/server` / `src/widget` / `src/shared` folders, and script placeholders (`architecture.md` → Repo layout). Put the spike's server code under `src/server/modules/spike/` (mirrors the module folder convention, so the later cleanup is a clean directory delete). Enables AC-1 through AC-6.
2. Stand up the MCP server with a streamable HTTP transport and register a trivial `spike_show` tool that first returns plain text (no UI yet). Resolve, before proceeding, how Claude Desktop connects to a remote streamable HTTP MCP server: the MCP endpoint path, the transport's allowed hosts / allowed origins (DNS rebinding protection) settings, and anything the no auth connector flow needs (all UNCONFIRMED, see Follow-up). Reach the server from Claude Desktop through the local tunnel and confirm `spike_show` is callable. Also verify the transport class name and import at build (expected `StreamableHTTPServerTransport` from `@modelcontextprotocol/sdk/server/streamableHttp.js`, UNCONFIRMED). Threads toward **AC-1**.
3. Build the hello world React widget in `src/widget/spike` and the `vite.widget.config.ts` using `vite-plugin-singlefile` to output one HTML file; add the watch and rebuild script.
4. Register the `ui://spike/app.html` resource with `registerAppResource(..., { mimeType: RESOURCE_MIME_TYPE })` and link `spike_show` to it via `_meta.ui.resourceUri`. Confirm the widget renders inline in Claude Desktop. Verify the `RESOURCE_MIME_TYPE` value at build (UNCONFIRMED). Satisfies **AC-1**.
5. Add the `spike_state` tool (model + app) returning `{ count }`. Wire the app bridge in the widget: `useApp({ ontoolresult })` from `@modelcontextprotocol/ext-apps/react`; on mount, call `spike_state` via `app.callServerTool` and display `count`. Satisfies **AC-2**.
6. Add the `spike_ping` tool (app only, `visibility: ["app"]`) that increments and returns `{ count, at }`, and log each call; add the widget button that calls it and updates `count` on `ontoolresult`; confirm `count` increments across clicks. Verify the `callServerTool` signature at build (UNCONFIRMED). Satisfies **AC-3**, **AC-4**.
7. Confirm `spike_ping` is not offered to the model (inspect the server's tool list in Claude, or ask Claude to call it and confirm it cannot). Satisfies **AC-6**.
8. Deploy the server to Railway, point Claude Desktop at the Railway URL, and confirm the widget renders and the round trip works on the deployed path. Satisfies **AC-5**.

## Consequences

**Positive**:
- Retires the deepest risk (`foundation.md` §11) before any feature time is spent.
- Produces the reusable server, widget, and bundler skeleton the launch module builds directly on.
- Validates the pull model and the app only visibility enforcement path in isolation, where a failure is easy to localize.

**Negative / tradeoffs**:
- Some throwaway: `spike_show`, `spike_state`, and `spike_ping` are replaced by `launch_*` tools later (the scaffold and pipeline are kept, the three spike tools are not).
- A few hours go to a spike before any user facing feature exists.
- One time tunnel setup is a chore, and some tunnels buffer or mishandle long lived streamable HTTP connections (see Follow-up), so a working first request does not by itself prove the stream survives.
- In memory state means the counter resets on restart; this spike does not test persistence (by design).

**Neutral**:
- Four values are UNCONFIRMED from the docs and must be checked at build (the `RESOURCE_MIME_TYPE` value; the streamable HTTP transport class name; the full `callServerTool` signature; and how a remote client connects, meaning the endpoint path plus the allowed hosts / allowed origins settings). The References point at the exact pages to confirm them.
- New patterns to learn here: MCP server registration, `ext-apps` resource linking, `vite-singlefile`, and running a tunnel.

## Follow-up

- [ ] At build, confirm the four UNCONFIRMED values from the References and update `library-docs.md` if any differ from the assumptions above: `RESOURCE_MIME_TYPE`, the transport class/import, the `callServerTool` signature, and the remote connection details (endpoint path, allowed hosts / origins for the streamable HTTP transport).
- [ ] Reconcile `architecture.md` → Open architectural questions: the design time check indicates a pull model (widget calls `callServerTool` on mount), which the spike confirms in practice; mark that open question resolved once the spike passes.
- [ ] Prefer a tunnel known to pass long lived streamable HTTP connections (for example `cloudflared`); if the stream misbehaves through the tunnel, fall back to testing against the Railway deploy.
- [ ] Optional, non gating: confirm the widget also renders in claude.ai (`foundation.md` §7 #13 notes claude.ai renders third party widgets; confirm ours does too).
- [ ] After the spike passes, delete the `src/server/modules/spike/` directory and the spike widget, keep the scaffold; the next slice is Layer 0 persistence (the `users`/`modules`/`items` schema, Drizzle, the module registry), then the launch module keystone (`build-graph.md`).

## References

**Project sources** (verifiable, in this repo):
- `foundation.md` §7 #1 (build on the MCP Apps extension), §7 #15 (prove render first), §11 (the deepest risk), §7 #10 to #11 (visibility).
- `architecture.md` → Keystone unlock, Open build time decisions, and Open architectural questions; `build-graph.md` → Layer 0 and the one genuine tension; `library-docs.md` → the `@modelcontextprotocol/ext-apps` entry.

**Practices & standards**:
- Tracer Bullet: prove one thin thread end to end through every layer before thickening it.
- Design for failure: prove the external rendering surface before building features on top of it.

**Links** (web verified during this design conversation):
- MCP Apps API docs: https://apps.extensions.modelcontextprotocol.io/api/
- MCP Apps Quickstart: https://apps.extensions.modelcontextprotocol.io/api/documents/Quickstart.html
- Starter example (basic-server-react): https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/basic-server-react
- ext-apps repository and README: https://github.com/modelcontextprotocol/ext-apps
