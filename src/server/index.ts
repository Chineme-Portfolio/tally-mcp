import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import { env } from "./env.js";
import { createServer } from "./mcp.js";

// Streamable HTTP entry point. Claude Desktop connects to <host>/mcp.
//
// createMcpExpressApp sets up the Express app with the host binding and the
// protections the SDK recommends (this is the helper the official example
// uses). We add permissive CORS for the spike. Each request builds a fresh
// server and transport in stateless mode (sessionIdGenerator: undefined).
const app = createMcpExpressApp({ host: "0.0.0.0" });
app.use(cors());

app.all("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(env.PORT, () => {
  console.log(`[tally] MCP server listening on http://localhost:${env.PORT}/mcp`);
});
