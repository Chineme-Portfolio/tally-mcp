import { z } from "zod";

// One source of truth for the shapes the server and the widget both use
// (code-standards.md §2). The server builds these; the widget parses them and
// builds the tool inputs. (Spec 0004: renamed from launch.ts, board aware.)

export const BoardItemStatus = z.enum(["todo", "active", "blocked", "done"]);
export type BoardItemStatus = z.infer<typeof BoardItemStatus>;

/** A task as the widget sees it (the DB timestamps are not sent). */
export const BoardItem = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: BoardItemStatus,
  position: z.number().int(),
});
export type BoardItem = z.infer<typeof BoardItem>;

/** The current board's identity, carried on every result so Claude and the
 * widget always know which board an action touched. */
export const BoardRef = z.object({ id: z.string().uuid(), name: z.string() });
export type BoardRef = z.infer<typeof BoardRef>;

/** A board as a tab in the switcher: identity, whether it is current, and its
 * counts. readiness is done / total, from 0 to 1. */
export const BoardSummary = z.object({
  id: z.string().uuid(),
  name: z.string(),
  current: z.boolean(),
  itemCount: z.number().int(),
  readiness: z.number(),
});
export type BoardSummary = z.infer<typeof BoardSummary>;

/** The core state of one board: its tasks plus readiness. */
export const BoardState = z.object({
  items: z.array(BoardItem),
  readiness: z.number(),
});
export type BoardState = z.infer<typeof BoardState>;

/** The widget's mount fetch, and the result of any board switch/create/delete/
 * rename: the current board, all boards as tabs, and the current board's items.
 * The full tab set only rides on board level changes, never on item writes. */
export const BoardView = BoardState.extend({
  board: BoardRef,
  boards: z.array(BoardSummary),
});
export type BoardView = z.infer<typeof BoardView>;

/** An item mutation result: the current board (for context), the changed item
 * when there is one, and the board's new state. No tab set here (the widget
 * updates the current tab from items + readiness) so item writes stay light. */
export const BoardMutation = BoardState.extend({
  board: BoardRef,
  item: BoardItem.optional(),
});
export type BoardMutation = z.infer<typeof BoardMutation>;

/** board_list: every board as a tab, for Claude to reason from. */
export const BoardList = z.object({ boards: z.array(BoardSummary) });
export type BoardList = z.infer<typeof BoardList>;

// Board names: trimmed, 1 to 100 chars, unique per owner.
const boardName = z
  .string()
  .trim()
  .min(1, "board name is required")
  .max(100, "board name is too long");
export const CreateBoardInput = z.object({ name: boardName });
export const SwitchBoardInput = z.object({ name: boardName });
export const RenameBoardInput = z.object({ name: boardName });
export const DeleteBoardInput = z.object({ name: boardName });

// Item inputs. Titles are trimmed and bounded (1 to 500 chars).
const title = z.string().trim().min(1, "title is required").max(500, "title is too long");
export const AddInput = z.object({ title });
export const EditInput = z.object({ id: z.string().uuid(), title });
export const SetStatusInput = z.object({ id: z.string().uuid(), status: BoardItemStatus });
export const DeleteInput = z.object({ id: z.string().uuid() });
export const ReorderInput = z.object({ orderedIds: z.array(z.string().uuid()) });
export const MoveInput = z.object({
  id: z.string().uuid(),
  position: z.number().int().nonnegative(),
});

// Ship + history (spec 0003 + 0004).
export const ShipRun = z.object({
  id: z.string().uuid(),
  shippedAt: z.string(),
  itemCount: z.number().int(),
});
export type ShipRun = z.infer<typeof ShipRun>;

/** board_ship result: the archived run plus the now empty board. */
export const ShipResult = BoardState.extend({ board: BoardRef, run: ShipRun });
export type ShipResult = z.infer<typeof ShipResult>;

export const HistoryInput = z.object({
  limit: z.number().int().positive().max(20).optional(),
});
export const HistoryRun = z.object({
  id: z.string().uuid(),
  boardName: z.string(),
  shippedAt: z.string(),
  itemCount: z.number().int(),
  titles: z.array(z.string()),
});
export const HistoryOutput = z.object({ runs: z.array(HistoryRun) });
export type HistoryOutput = z.infer<typeof HistoryOutput>;
