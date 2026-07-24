import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BoardState } from "../../../shared/launch.js";
import {
  AddInput,
  DeleteInput,
  EditInput,
  HistoryInput,
  MoveInput,
  ReorderInput,
  SetStatusInput,
} from "../../../shared/launch.js";
import {
  addItem,
  deleteItem,
  editItem,
  listBoard,
  listRuns,
  moveItem,
  reorder,
  resetBoard,
  setStatus,
  shipBoard,
} from "./repo.js";
import { LAUNCH_RESOURCE_URI, readLaunchWidgetHtml } from "./resource.js";

// Shapes a tool result: the model reads the text, the widget reads the
// structured content.
function toolResult(payload: object) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload) }],
    structuredContent: payload as Record<string, unknown>,
  };
}

// A short text summary of the board, for Claude to reason from in conversation.
function summarize(state: BoardState): string {
  const total = state.items.length;
  if (total === 0) return "The launch board is empty. Nothing here yet.";
  const by = { todo: 0, active: 0, blocked: 0, done: 0 };
  for (const it of state.items) by[it.status] += 1;
  const pct = Math.round(state.readiness * 100);
  const parts: string[] = [];
  if (by.active) parts.push(`${by.active} active`);
  if (by.blocked) parts.push(`${by.blocked} blocked`);
  if (by.todo) parts.push(`${by.todo} to go`);
  const tail = parts.length ? ` (${parts.join(", ")})` : "";
  return `Launch readiness ${pct}%: ${by.done} of ${total} done${tail}.`;
}

// Registers module one: the launch readiness board. A module is its own tool
// prefix + ui:// widget + own tables + registry row (foundation.md §9).
//
// Visibility (foundation.md §7 #10 to #11): reads and writes are model+app so
// Claude and the widget both operate the board; only launch_item_reorder is
// app only (a drag gesture the model has no business calling).
export function registerLaunch(server: McpServer): void {
  // Render tool. Linking it to the resource via _meta.ui.resourceUri is what
  // makes the host render the widget. It also returns the current board so
  // Claude has the state.
  registerAppTool(
    server,
    "launch_board_show",
    {
      title: "Show the launch board",
      description: "Renders the launch readiness board widget inline.",
      inputSchema: {},
      _meta: { ui: { resourceUri: LAUNCH_RESOURCE_URI, visibility: ["model", "app"] } },
    },
    async () => toolResult(await listBoard()),
  );

  // The board read. The widget calls this on mount for its data (structured);
  // Claude reads the text summary. This is the pull model mount fetch, kept
  // separate from the render tool (spec 0002).
  registerAppTool(
    server,
    "launch_status",
    {
      title: "Read the launch board",
      description: "Returns the current tasks and readiness.",
      inputSchema: {},
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async () => {
      const state = await listBoard();
      return {
        content: [{ type: "text" as const, text: summarize(state) }],
        structuredContent: state as unknown as Record<string, unknown>,
      };
    },
  );

  registerAppTool(
    server,
    "launch_item_add",
    {
      title: "Add a task",
      description: "Adds a task to the launch board.",
      inputSchema: AddInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => toolResult(await addItem(args.title)),
  );

  registerAppTool(
    server,
    "launch_item_edit",
    {
      title: "Edit a task",
      description: "Changes a task's title.",
      inputSchema: EditInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => toolResult(await editItem(args.id, args.title)),
  );

  registerAppTool(
    server,
    "launch_item_set_status",
    {
      title: "Set a task's status",
      description: "Sets a task to todo, active, blocked, or done.",
      inputSchema: SetStatusInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => toolResult(await setStatus(args.id, args.status)),
  );

  registerAppTool(
    server,
    "launch_item_delete",
    {
      title: "Delete a task",
      description: "Removes a task from the board.",
      inputSchema: DeleteInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => toolResult(await deleteItem(args.id)),
  );

  registerAppTool(
    server,
    "launch_board_reset",
    {
      title: "Reset the board",
      description: "Sets every task back to todo.",
      inputSchema: {},
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async () => toolResult(await resetBoard()),
  );

  // Ship the board (app only, spec 0003). It archives and empties the board, a
  // human commitment, so the model cannot call it; the widget's button does.
  registerAppTool(
    server,
    "launch_board_ship",
    {
      title: "Ship the launch",
      description:
        "Archives the finished board as a launch record and clears it for the next launch. Only allowed when every task is done.",
      inputSchema: {},
      _meta: { ui: { visibility: ["app"] } },
    },
    async () => toolResult(await shipBoard()),
  );

  // Read recent launches (model + app), so Claude can answer "what did I ship
  // last time?". Reading history is fine for the model; only shipping is not.
  registerAppTool(
    server,
    "launch_history",
    {
      title: "Recent launches",
      description: "Returns recent shipped launches (date, task count, titles).",
      inputSchema: HistoryInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => toolResult(await listRuns(args.limit)),
  );

  // Move one task to a position (model+app). Claude's conversational reorder
  // ("move X to the top"); the widget uses drag + launch_item_reorder instead.
  registerAppTool(
    server,
    "launch_item_move",
    {
      title: "Move a task",
      description:
        "Moves a task to a new position (0 is the top). Use this to reorder the board from the conversation.",
      inputSchema: MoveInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => toolResult(await moveItem(args.id, args.position)),
  );

  // App only: reorder takes the whole new order (what a drag produces). The
  // widget calls it; the model cannot. Claude reorders via launch_item_move.
  registerAppTool(
    server,
    "launch_item_reorder",
    {
      title: "Reorder tasks",
      description: "Persists a new task order (drag to reorder).",
      inputSchema: ReorderInput.shape,
      _meta: { ui: { visibility: ["app"] } },
    },
    async (args) => toolResult(await reorder(args.orderedIds)),
  );

  // The widget resource: one self contained HTML file built by vite-singlefile.
  registerAppResource(
    server,
    LAUNCH_RESOURCE_URI,
    LAUNCH_RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const html = await readLaunchWidgetHtml();
      return {
        contents: [
          { uri: LAUNCH_RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  // The discoverable trigger (foundation.md §7 #12). Picking it in the client
  // seeds a message that leads Claude to call launch_board_show.
  server.registerPrompt(
    "launch-board",
    {
      title: "Launch board",
      description: "Show my launch readiness board.",
    },
    () => ({
      messages: [
        {
          role: "user" as const,
          content: { type: "text" as const, text: "Show my launch readiness board." },
        },
      ],
    }),
  );
}
