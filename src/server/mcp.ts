import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { UserId } from "./auth/identity.js";
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
  const server = new McpServer({ name: "tally", version: "0.1.0" });
  registerBoard(server, userId);
  return server;
}
