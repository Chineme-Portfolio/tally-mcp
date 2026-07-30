import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { UserId } from "./auth/identity.js";
import { publicBaseUrl } from "./icon.js";
import { registerBoard } from "./modules/board/index.js";

// Builds a fresh MCP server instance for ONE request. The transport calls this
// per request (stateless streamable HTTP), which is exactly why the signed in
// user is passed in: the tools close over that one owner, so a handler can
// never reach for an ambient user and there is no per request state to leak
// between requests. Durable state lives in Postgres (see db/client.ts, a module
// scope singleton).
//
// Adding module two later is the same shape: import its register function and
// call it here with the same owner (foundation.md §9, the module pattern).
export function createServer(userId: UserId): McpServer {
  const server = new McpServer({
    name: "tally",
    version: "0.1.0",
    // How Tally presents itself to a client: a readable title, what it is, where
    // to find it, and an icon to show instead of a placeholder letter. Whether a
    // given client renders the icon is up to that client; declaring it costs
    // nothing and is what the protocol provides for.
    title: "Tally",
    description:
      "Checklist boards that render as an interactive widget in the conversation, backed by Postgres.",
    websiteUrl: "https://github.com/Chineme-Portfolio/tally-mcp",
    icons: [
      {
        src: `${publicBaseUrl()}/icon.svg`,
        mimeType: "image/svg+xml",
        sizes: ["any"],
      },
    ],
  });
  registerBoard(server, userId);
  return server;
}
