import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBoard } from "./modules/board/index.js";

// Builds a fresh MCP server instance. The transport calls this once per request
// (stateless streamable HTTP), so keep per request state out of here; durable
// state lives in Postgres (see db/client.ts, a module scope singleton).
//
// Adding module two later is the same shape: import its register function and
// call it here (foundation.md §9, the module pattern).
export function createServer(): McpServer {
  const server = new McpServer({ name: "tally", version: "0.1.0" });
  registerBoard(server);
  return server;
}
