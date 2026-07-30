import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  BoardItem,
  BoardList,
  BoardSummary,
  BoardView,
  ShipResult,
} from "../../../shared/board.js";
import {
  AddInput,
  CreateBoardInput,
  DeleteBoardInput,
  DeleteInput,
  EditInput,
  HistoryInput,
  MoveInput,
  RenameBoardInput,
  ReorderInput,
  SetStatusInput,
  SwitchBoardInput,
} from "../../../shared/board.js";
import type { UserId } from "../../auth/identity.js";
import {
  addItem,
  boardView,
  createBoard,
  deleteBoard,
  deleteItem,
  editItem,
  listBoards,
  listRuns,
  moveItem,
  renameBoard,
  reorder,
  resetBoard,
  setStatus,
  shipBoard,
  switchBoard,
} from "./repo.js";
import { BOARD_RESOURCE_URI, readBoardWidgetHtml } from "./resource.js";

// Shapes a tool result: the model reads the text, the widget reads the
// structured content.
function toolResult(payload: object, text?: string) {
  return {
    content: [{ type: "text" as const, text: text ?? JSON.stringify(payload) }],
    structuredContent: payload as Record<string, unknown>,
  };
}

function pct(readiness: number): number {
  return Math.round(readiness * 100);
}

// A short text summary of one board's state, for Claude to reason from.
function summarizeState(name: string, items: BoardItem[], readiness: number): string {
  const total = items.length;
  if (total === 0) return `Board "${name}" is empty. Nothing here yet.`;
  const by = { todo: 0, active: 0, blocked: 0, done: 0 };
  for (const it of items) by[it.status] += 1;
  const parts: string[] = [];
  if (by.active) parts.push(`${by.active} active`);
  if (by.blocked) parts.push(`${by.blocked} blocked`);
  if (by.todo) parts.push(`${by.todo} to go`);
  const tail = parts.length ? ` (${parts.join(", ")})` : "";
  return `Board "${name}" readiness ${pct(readiness)}%: ${by.done} of ${total} done${tail}.`;
}

// The current board plus a note of the others, for board_show / board_status.
function summarizeView(view: BoardView): string {
  const head = summarizeState(view.board.name, view.items, view.readiness);
  const others = view.boards.filter((b) => !b.current);
  if (others.length === 0) return head;
  const list = others.map((b) => `${b.name} ${pct(b.readiness)}%`).join(", ");
  return `${head} Other boards: ${list}.`;
}

function summarizeList(boards: BoardSummary[]): string {
  if (boards.length === 0) return "No boards yet.";
  const n = boards.length;
  const rows = boards
    .map(
      (b) =>
        `${b.name}${b.current ? " (current)" : ""}: ${b.itemCount} items, ${pct(b.readiness)}%`,
    )
    .join("; ");
  return `${n} board${n > 1 ? "s" : ""}: ${rows}.`;
}

// Registers module one: the board (a general checklist, launch flavored). A
// module is its own tool prefix + ui:// widget + own tables + registry row
// (foundation.md §9).
//
// Visibility (foundation.md §7 #10, #11, #17): reads and writes are model+app so
// Claude and the widget both operate boards; only board_item_reorder (a drag)
// and board_ship (a human commitment that clears the board) are app only.
export function registerBoard(server: McpServer, userId: UserId): void {
  // Render tool. Linking it to the resource via _meta.ui.resourceUri is what
  // makes the host render the widget. It also returns the current board (with
  // the tab set) so Claude has the state.
  registerAppTool(
    server,
    "board_show",
    {
      title: "Show my board",
      description:
        "Renders my board (a checklist) as an interactive widget inline, with a tab per board.",
      inputSchema: {},
      _meta: { ui: { resourceUri: BOARD_RESOURCE_URI, visibility: ["model", "app"] } },
    },
    async () => {
      const view = await boardView(userId);
      return toolResult(view, summarizeView(view));
    },
  );

  // The board read. The widget calls this on mount for its data (structured):
  // the current board, its items, and every board as a tab. Claude reads the
  // text summary. This is the pull model mount fetch (spec 0002, 0004).
  registerAppTool(
    server,
    "board_status",
    {
      title: "Read my board",
      description:
        "Returns the current board's items and readiness, plus the list of boards (tabs).",
      inputSchema: {},
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async () => {
      const view = await boardView(userId);
      return toolResult(view, summarizeView(view));
    },
  );

  // List every board (a checklist) with its progress. Model + app.
  registerAppTool(
    server,
    "board_list",
    {
      title: "List my boards",
      description: "Lists all my boards (checklists) with their item counts and readiness.",
      inputSchema: {},
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async () => {
      const list = await listBoards(userId);
      return toolResult(list, summarizeList(list.boards));
    },
  );

  // Create a board and switch to it. This is what Claude reaches for on any
  // "give me a checklist for X" request: make a board named X, then add items.
  registerAppTool(
    server,
    "board_create",
    {
      title: "Create a board",
      description:
        "Creates a new board (a checklist) by name and makes it current. Use this for any new checklist or to-do list, then add items with board_item_add.",
      inputSchema: CreateBoardInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => {
      const view = await createBoard(userId, args.name);
      return toolResult(view, summarizeView(view));
    },
  );

  // Switch the current board by name.
  registerAppTool(
    server,
    "board_switch",
    {
      title: "Switch board",
      description: "Switches to one of my boards by name, making it the current board.",
      inputSchema: SwitchBoardInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => {
      const view = await switchBoard(userId, args.name);
      return toolResult(view, summarizeView(view));
    },
  );

  // Rename the current board.
  registerAppTool(
    server,
    "board_rename",
    {
      title: "Rename board",
      description: "Renames the current board.",
      inputSchema: RenameBoardInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => {
      const view = await renameBoard(userId, args.name);
      return toolResult(view, summarizeView(view));
    },
  );

  // Delete a board by name (its items go too; past ships are kept).
  registerAppTool(
    server,
    "board_delete",
    {
      title: "Delete a board",
      description:
        "Deletes a board by name and removes its items. Its past shipped records are kept. If it was current, the next board becomes current.",
      inputSchema: DeleteBoardInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => {
      const view = await deleteBoard(userId, args.name);
      return toolResult(view, summarizeView(view));
    },
  );

  registerAppTool(
    server,
    "board_item_add",
    {
      title: "Add an item",
      description: "Adds an item to the current board.",
      inputSchema: AddInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => {
      const m = await addItem(userId, args.title);
      return toolResult(m, summarizeState(m.board.name, m.items, m.readiness));
    },
  );

  registerAppTool(
    server,
    "board_item_edit",
    {
      title: "Edit an item",
      description: "Changes an item's text on the current board.",
      inputSchema: EditInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => {
      const m = await editItem(userId, args.id, args.title);
      return toolResult(m, summarizeState(m.board.name, m.items, m.readiness));
    },
  );

  registerAppTool(
    server,
    "board_item_set_status",
    {
      title: "Set an item's status",
      description: "Sets an item to todo, active, blocked, or done on the current board.",
      inputSchema: SetStatusInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => {
      const m = await setStatus(userId, args.id, args.status);
      return toolResult(m, summarizeState(m.board.name, m.items, m.readiness));
    },
  );

  registerAppTool(
    server,
    "board_item_delete",
    {
      title: "Delete an item",
      description: "Removes an item from the current board.",
      inputSchema: DeleteInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => {
      const m = await deleteItem(userId, args.id);
      return toolResult(m, summarizeState(m.board.name, m.items, m.readiness));
    },
  );

  // Move one item to a position (model+app). Claude's conversational reorder
  // ("move X to the top"); the widget uses drag + board_item_reorder instead.
  registerAppTool(
    server,
    "board_item_move",
    {
      title: "Move an item",
      description:
        "Moves an item to a new position (0 is the top) on the current board. Use this to reorder from the conversation.",
      inputSchema: MoveInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => {
      const m = await moveItem(userId, args.id, args.position);
      return toolResult(m, summarizeState(m.board.name, m.items, m.readiness));
    },
  );

  registerAppTool(
    server,
    "board_reset",
    {
      title: "Reset the board",
      description: "Sets every item on the current board back to todo.",
      inputSchema: {},
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async () => {
      const m = await resetBoard(userId);
      return toolResult(m, summarizeState(m.board.name, m.items, m.readiness));
    },
  );

  // App only: reorder takes the whole new order (what a drag produces). The
  // widget calls it; the model cannot. Claude reorders via board_item_move.
  registerAppTool(
    server,
    "board_item_reorder",
    {
      title: "Reorder items",
      description: "Persists a new item order on the current board (drag to reorder).",
      inputSchema: ReorderInput.shape,
      _meta: { ui: { visibility: ["app"] } },
    },
    async (args) => {
      const m = await reorder(userId, args.orderedIds);
      return toolResult(m, summarizeState(m.board.name, m.items, m.readiness));
    },
  );

  // Ship the board (app only, spec 0003). It archives and empties the current
  // board, a human commitment, so the model cannot call it; the widget's button
  // does. The board stays (now empty); board_delete removes a board entirely.
  registerAppTool(
    server,
    "board_ship",
    {
      title: "Ship the board",
      description:
        "Archives the finished board as a record and clears it for the next run. Only allowed when every item is done.",
      inputSchema: {},
      _meta: { ui: { visibility: ["app"] } },
    },
    async () => {
      const result: ShipResult = await shipBoard(userId);
      const text = `Shipped "${result.board.name}". ${result.run.itemCount} done, board's clear.`;
      return toolResult(result, text);
    },
  );

  // Read recent launches across all boards (model + app), so Claude can answer
  // "what did I ship last time?". Reading history is fine for the model; only
  // shipping is not.
  registerAppTool(
    server,
    "board_history",
    {
      title: "Recent launches",
      description:
        "Returns recent shipped boards across all my boards (date, board name, item count, titles).",
      inputSchema: HistoryInput.shape,
      _meta: { ui: { visibility: ["model", "app"] } },
    },
    async (args) => toolResult(await listRuns(userId, args.limit)),
  );

  // The widget resource: one self contained HTML file built by vite-singlefile.
  registerAppResource(
    server,
    BOARD_RESOURCE_URI,
    BOARD_RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const html = await readBoardWidgetHtml();
      return {
        contents: [
          { uri: BOARD_RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  // The discoverable trigger (foundation.md §7 #12). Picking it in the client
  // seeds a message that leads Claude to call board_show.
  server.registerPrompt(
    "board",
    {
      title: "Board",
      description: "Show my board.",
    },
    () => ({
      messages: [
        {
          role: "user" as const,
          content: { type: "text" as const, text: "Show my board." },
        },
      ],
    }),
  );
}
