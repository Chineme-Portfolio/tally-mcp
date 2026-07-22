import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SpikePing, SpikeState } from "../../../shared/schemas.js";
import { readSpikeWidgetHtml, SPIKE_RESOURCE_URI } from "./resource.js";
import { getCount, increment } from "./state.js";

// Registers the render spike: one render tool, one read tool, one app only
// write tool, and the widget resource they render. This whole directory is
// throwaway once the launch module lands; it exists only to prove the pipeline.
//
// Visibility is the point of the spike (spec 0001, AC-6):
//   spike_show, spike_state  ->  model and app (default, so we omit the field)
//   spike_ping               ->  app only (set explicitly), so Claude cannot
//                                 call it from the conversation; only the widget can.
export function registerSpike(server: McpServer): void {
  // Render tool. The user or Claude invokes this; linking it to the resource
  // via _meta.ui.resourceUri is what makes the host render the widget.
  registerAppTool(
    server,
    "spike_show",
    {
      title: "Show the spike widget",
      description: "Renders the render spike widget inline.",
      inputSchema: {},
      _meta: { ui: { resourceUri: SPIKE_RESOURCE_URI, visibility: ["model", "app"] } },
    },
    async () => {
      const payload: SpikeState = { count: getCount() };
      return {
        content: [{ type: "text", text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    },
  );

  // Read tool. The widget calls this on mount to get the current count. This
  // is the first bridge call, so it isolates the pull model (AC-2).
  registerAppTool(
    server,
    "spike_state",
    {
      title: "Read the spike count",
      description: "Returns the current in memory count.",
      inputSchema: {},
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async () => {
      const payload: SpikeState = { count: getCount() };
      return {
        content: [{ type: "text", text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    },
  );

  // Write tool. The widget button calls this. App only (AC-3, AC-4, AC-6).
  registerAppTool(
    server,
    "spike_ping",
    {
      title: "Increment the spike count",
      description: "Increments the in memory count and returns it.",
      inputSchema: {},
      _meta: { ui: { visibility: ["app"] } },
    },
    async () => {
      const payload: SpikePing = {
        count: increment(),
        at: new Date().toISOString(),
      };
      console.log(`[spike] spike_ping called, count is now ${payload.count}`);
      return {
        content: [{ type: "text", text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    },
  );

  // The widget resource: one self contained HTML file built by vite-singlefile.
  registerAppResource(
    server,
    SPIKE_RESOURCE_URI,
    SPIKE_RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const html = await readSpikeWidgetHtml();
      return {
        contents: [
          { uri: SPIKE_RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );
}
