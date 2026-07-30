import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import {
  getOAuthProtectedResourceMetadataUrl,
  mcpAuthMetadataRouter,
} from "@modelcontextprotocol/sdk/server/auth/router.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { RequestHandler } from "express";
import { localAccount, resolveAccount, type UserId } from "./auth/identity.js";
import { clerkTokenVerifier, principalFrom } from "./auth/verifier.js";
import { authRequired, env } from "./env.js";
import { ICON_SVG } from "./icon.js";
import { createServer } from "./mcp.js";

// Streamable HTTP entry point. Claude connects to <host>/mcp.
//
// createMcpExpressApp sets up the Express app with the host binding and the
// protections the SDK recommends. Each request builds a fresh server and
// transport in stateless mode (sessionIdGenerator: undefined), so the signed in
// user is resolved per request and handed to createServer.
const app = createMcpExpressApp({ host: "0.0.0.0" });
app.use(cors());

// The server's icon, deliberately PUBLIC and outside the auth gate below: a
// client fetches it to render Tally in a connector list, before anyone has
// signed in and with no token to present. It is a static image and reveals
// nothing about any account.
app.get("/icon.svg", (_req, res) => {
  res.type("image/svg+xml").set("Cache-Control", "public, max-age=86400").send(ICON_SVG);
});

// Authentication (spec 0005). Tally is an OAuth resource server: Clerk issues
// and signs tokens, Tally only verifies them.
//
// requireBearerAuth validates the token through our verifier and answers an
// unauthenticated request with 401 plus the WWW-Authenticate challenge pointing
// at the metadata document (AC-1). mcpAuthMetadataRouter serves that document
// (AC-2). The path is derived ONCE from the SDK's own helper and reused for
// both, so the path advertised in the challenge can never drift from the path
// actually served.
let authGate: RequestHandler = (_req, _res, next) => next();

if (authRequired) {
  const resourceUrl = new URL(env.TALLY_RESOURCE_URL!);
  const issuerUrl = new URL(env.CLERK_ISSUER_URL!);
  const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(resourceUrl);

  app.use(
    mcpAuthMetadataRouter({
      oauthMetadata: {
        issuer: issuerUrl.href,
        authorization_endpoint: new URL("/oauth/authorize", issuerUrl).href,
        token_endpoint: new URL("/oauth/token", issuerUrl).href,
        registration_endpoint: new URL("/oauth/register", issuerUrl).href,
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code", "refresh_token"],
        code_challenge_methods_supported: ["S256"],
      },
      resourceServerUrl: resourceUrl,
      scopesSupported: ["openid", "profile", "email"],
      resourceName: "Tally",
    }),
  );

  authGate = requireBearerAuth({
    verifier: clerkTokenVerifier,
    resourceMetadataUrl,
  });
}

app.all("/mcp", authGate, async (req, res) => {
  // Resolve WHO this request belongs to, once, here. With auth on, the identity
  // comes from the verified token; with AUTH_MODE=none there is no token and
  // every request is the one local user (env.ts refuses that mode off
  // localhost). Everything downstream receives this owner explicitly.
  let userId: UserId;
  if (authRequired) {
    const principal = principalFrom(req.auth);
    if (!principal) {
      // requireBearerAuth should have rejected this already; if it somehow did
      // not, fail closed rather than serving someone an arbitrary account.
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    userId = await resolveAccount(principal);
  } else {
    userId = localAccount();
  }

  const server = createServer(userId);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(env.PORT, () => {
  const mode = authRequired ? "auth: on" : "auth: OFF (local single user)";
  console.log(`[tally] MCP server listening on http://localhost:${env.PORT}/mcp (${mode})`);
});
