import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import type {
  BoardItem,
  BoardItemStatus,
  BoardList,
  BoardMutation,
  BoardRef,
  BoardState,
  BoardSummary,
  BoardView,
  HistoryOutput,
  ShipResult,
} from "../../../shared/board.js";
import { db } from "../../db/client.js";
import {
  type BoardItemRow,
  type BoardRow,
  boardItems,
  boardRuns,
  boards,
} from "../../db/schema.js";
import { resolveUserId } from "../../user.js";

// All access to the board tables lives here. EVERY query filters by
// resolveUserId() (code-standards.md §5), and every item/status/ship query ALSO
// filters by the current board_id (spec 0004), so an action never touches
// another board. An unscoped query is a bug.

// The board a brand new owner gets, and the name the migration seeded.
const DEFAULT_BOARD_NAME = "Launch readiness";

function toItem(row: BoardItemRow): BoardItem {
  return { id: row.id, title: row.title, status: row.status, position: row.position };
}

function ref(board: BoardRow): BoardRef {
  return { id: board.id, name: board.name };
}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "23505"
  );
}

// The current board is the owner's board with the greatest last_active_at (ties
// broken by created_at). If the owner has none, create the default, race safe:
// two near simultaneous calls collide on the unique (user_id, name) index, one
// insert wins, and both read the same row back. This is the ONLY definition of
// "current"; nothing else re derives it.
async function currentBoard(): Promise<BoardRow> {
  const userId = resolveUserId();
  const [existing] = await db
    .select()
    .from(boards)
    .where(eq(boards.userId, userId))
    .orderBy(desc(boards.lastActiveAt), desc(boards.createdAt))
    .limit(1);
  if (existing) return existing;
  await db
    .insert(boards)
    .values({ userId, name: DEFAULT_BOARD_NAME })
    .onConflictDoNothing({ target: [boards.userId, boards.name] });
  const [created] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.userId, userId), eq(boards.name, DEFAULT_BOARD_NAME)))
    .limit(1);
  if (!created) throw new Error("current board: could not resolve or create a board");
  return created;
}

// The state of one board: its items in order, plus readiness (empty reads 0,
// never NaN).
async function boardStateFor(boardId: string): Promise<BoardState> {
  const userId = resolveUserId();
  const rows = await db
    .select()
    .from(boardItems)
    .where(and(eq(boardItems.userId, userId), eq(boardItems.boardId, boardId)))
    .orderBy(asc(boardItems.position), asc(boardItems.createdAt));
  const items = rows.map(toItem);
  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const readiness = total === 0 ? 0 : done / total;
  return { items, readiness };
}

// Every board as a tab: identity, whether it is current, and its counts. Counts
// are grouped in memory (a personal tool has few boards and items), which keeps
// this one owner scoped item read instead of a per board query.
async function boardSummaries(currentId: string): Promise<BoardSummary[]> {
  const userId = resolveUserId();
  const boardRows = await db
    .select()
    .from(boards)
    .where(eq(boards.userId, userId))
    .orderBy(asc(boards.createdAt));
  const itemRows = await db
    .select({ boardId: boardItems.boardId, status: boardItems.status })
    .from(boardItems)
    .where(eq(boardItems.userId, userId));
  return boardRows.map((b) => {
    const its = itemRows.filter((i) => i.boardId === b.id);
    const total = its.length;
    const done = its.filter((i) => i.status === "done").length;
    return {
      id: b.id,
      name: b.name,
      current: b.id === currentId,
      itemCount: total,
      readiness: total === 0 ? 0 : done / total,
    };
  });
}

// The widget's mount fetch: the current board, all boards as tabs, its items.
export async function boardView(): Promise<BoardView> {
  const board = await currentBoard();
  const state = await boardStateFor(board.id);
  const summaries = await boardSummaries(board.id);
  return { board: ref(board), boards: summaries, ...state };
}

// board_list: every board as a tab, for Claude.
export async function listBoards(): Promise<BoardList> {
  const board = await currentBoard();
  return { boards: await boardSummaries(board.id) };
}

// ---- Board management (spec 0004) ----

// Create a board and make it current (its default last_active_at = now() is the
// latest). A duplicate name is a clean error, never a raw unique violation.
export async function createBoard(name: string): Promise<BoardView> {
  const userId = resolveUserId();
  try {
    await db.insert(boards).values({ userId, name });
  } catch (e) {
    if (isUniqueViolation(e)) throw new Error(`a board named "${name}" already exists`);
    throw e;
  }
  return boardView();
}

// Switch the current board by name. The update both makes it current and proves
// it exists (RETURNING); an unknown name is a clean error, never a silent create.
export async function switchBoard(name: string): Promise<BoardView> {
  const userId = resolveUserId();
  const [b] = await db
    .update(boards)
    .set({ lastActiveAt: sql`now()` })
    .where(and(eq(boards.userId, userId), eq(boards.name, name)))
    .returning({ id: boards.id });
  if (!b) throw new Error(`no board named "${name}"`);
  return boardView();
}

// Rename the current board. Colliding with another board's name is a clean error.
export async function renameBoard(name: string): Promise<BoardView> {
  const userId = resolveUserId();
  const board = await currentBoard();
  try {
    await db
      .update(boards)
      .set({ name })
      .where(and(eq(boards.userId, userId), eq(boards.id, board.id)));
  } catch (e) {
    if (isUniqueViolation(e)) throw new Error(`a board named "${name}" already exists`);
    throw e;
  }
  return boardView();
}

// Delete a board by name. ON DELETE CASCADE removes its items in one statement;
// its past ships survive (board_id set null, board_name snapshot kept). If it
// was current, boardView() picks the next by last_active_at, or seeds a default
// if none remain. An unknown name is a clean error.
export async function deleteBoard(name: string): Promise<BoardView> {
  const userId = resolveUserId();
  const deleted = await db
    .delete(boards)
    .where(and(eq(boards.userId, userId), eq(boards.name, name)))
    .returning({ id: boards.id });
  if (deleted.length === 0) throw new Error(`no board named "${name}"`);
  return boardView();
}

// ---- Item operations (on the current board) ----

export async function addItem(title: string): Promise<BoardMutation> {
  const userId = resolveUserId();
  const board = await currentBoard();
  const rows = await db
    .select({ position: boardItems.position })
    .from(boardItems)
    .where(and(eq(boardItems.userId, userId), eq(boardItems.boardId, board.id)));
  const nextPosition = rows.reduce((max, r) => Math.max(max, r.position), -1) + 1;
  const [row] = await db
    .insert(boardItems)
    .values({ userId, boardId: board.id, title, position: nextPosition })
    .returning();
  if (!row) throw new Error("board_item_add: insert returned no row");
  return { board: ref(board), item: toItem(row), ...(await boardStateFor(board.id)) };
}

export async function editItem(id: string, title: string): Promise<BoardMutation> {
  const userId = resolveUserId();
  const board = await currentBoard();
  const [row] = await db
    .update(boardItems)
    .set({ title })
    .where(
      and(
        eq(boardItems.userId, userId),
        eq(boardItems.boardId, board.id),
        eq(boardItems.id, id),
      ),
    )
    .returning();
  if (!row) throw new Error(`board_item_edit: item ${id} not found on this board`);
  return { board: ref(board), item: toItem(row), ...(await boardStateFor(board.id)) };
}

export async function setStatus(
  id: string,
  status: BoardItemStatus,
): Promise<BoardMutation> {
  const userId = resolveUserId();
  const board = await currentBoard();
  const [row] = await db
    .update(boardItems)
    .set({ status })
    .where(
      and(
        eq(boardItems.userId, userId),
        eq(boardItems.boardId, board.id),
        eq(boardItems.id, id),
      ),
    )
    .returning();
  if (!row) throw new Error(`board_item_set_status: item ${id} not found on this board`);
  return { board: ref(board), item: toItem(row), ...(await boardStateFor(board.id)) };
}

export async function deleteItem(id: string): Promise<BoardMutation> {
  const userId = resolveUserId();
  const board = await currentBoard();
  const removed = await db
    .delete(boardItems)
    .where(
      and(
        eq(boardItems.userId, userId),
        eq(boardItems.boardId, board.id),
        eq(boardItems.id, id),
      ),
    )
    .returning({ id: boardItems.id });
  if (removed.length === 0) {
    throw new Error(`board_item_delete: item ${id} not found on this board`);
  }
  return { board: ref(board), ...(await boardStateFor(board.id)) };
}

export async function resetBoard(): Promise<BoardMutation> {
  const userId = resolveUserId();
  const board = await currentBoard();
  await db
    .update(boardItems)
    .set({ status: "todo" })
    .where(and(eq(boardItems.userId, userId), eq(boardItems.boardId, board.id)));
  return { board: ref(board), ...(await boardStateFor(board.id)) };
}

// Reorder the current board in one transaction (all or nothing). The given order
// wins; the board's items missing from the list are appended in their current
// order; unknown ids are ignored (spec 0002).
export async function reorder(orderedIds: string[]): Promise<BoardMutation> {
  const userId = resolveUserId();
  const board = await currentBoard();
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: boardItems.id })
      .from(boardItems)
      .where(and(eq(boardItems.userId, userId), eq(boardItems.boardId, board.id)))
      .orderBy(asc(boardItems.position), asc(boardItems.createdAt));
    const ownedInOrder = rows.map((r) => r.id);
    const owned = new Set(ownedInOrder);
    const seen = new Set<string>();
    const finalOrder: string[] = [];
    for (const id of orderedIds) {
      if (owned.has(id) && !seen.has(id)) {
        finalOrder.push(id);
        seen.add(id);
      }
    }
    for (const id of ownedInOrder) {
      if (!seen.has(id)) finalOrder.push(id);
    }
    for (let i = 0; i < finalOrder.length; i++) {
      await tx
        .update(boardItems)
        .set({ position: i })
        .where(
          and(
            eq(boardItems.userId, userId),
            eq(boardItems.boardId, board.id),
            eq(boardItems.id, finalOrder[i]!),
          ),
        );
    }
  });
  return { board: ref(board), ...(await boardStateFor(board.id)) };
}

// Move one task to a target position (0 is the top) on the current board. This
// is Claude's conversational reorder ("move X to the top"); the widget's drag
// uses reorder() instead (spec 0002 follow up).
export async function moveItem(id: string, position: number): Promise<BoardMutation> {
  const userId = resolveUserId();
  const board = await currentBoard();
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: boardItems.id })
      .from(boardItems)
      .where(and(eq(boardItems.userId, userId), eq(boardItems.boardId, board.id)))
      .orderBy(asc(boardItems.position), asc(boardItems.createdAt));
    const ids = rows.map((r) => r.id);
    const from = ids.indexOf(id);
    if (from === -1) throw new Error(`board_item_move: item ${id} not found on this board`);
    ids.splice(from, 1);
    const target = Math.max(0, Math.min(position, ids.length));
    ids.splice(target, 0, id);
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(boardItems)
        .set({ position: i })
        .where(
          and(
            eq(boardItems.userId, userId),
            eq(boardItems.boardId, board.id),
            eq(boardItems.id, ids[i]!),
          ),
        );
    }
  });
  return { board: ref(board), ...(await boardStateFor(board.id)) };
}

// Ship the current board (spec 0003, app only). The read, the "all done" check,
// the snapshot insert, and the delete ALL happen inside ONE transaction, scoped
// by board_id, and the delete targets only the snapshotted ids, so a task added
// at the same time is either archived with the rest or left on the board, never
// silently lost (the 0003 cross-check finding, carried forward). The board stays
// (now empty); a separate board_delete removes a board.
export async function shipBoard(): Promise<ShipResult> {
  const userId = resolveUserId();
  const board = await currentBoard();
  const run = await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(boardItems)
      .where(and(eq(boardItems.userId, userId), eq(boardItems.boardId, board.id)))
      .orderBy(asc(boardItems.position), asc(boardItems.createdAt));
    if (rows.length === 0) throw new Error("board_ship: the board is empty");
    if (!rows.every((r) => r.status === "done")) {
      throw new Error("board_ship: every task must be done to ship");
    }
    const snapshot = rows.map((r) => ({
      title: r.title,
      status: r.status,
      position: r.position,
    }));
    const [inserted] = await tx
      .insert(boardRuns)
      .values({
        userId,
        boardId: board.id,
        boardName: board.name,
        itemCount: rows.length,
        items: snapshot,
      })
      .returning({
        id: boardRuns.id,
        shippedAt: boardRuns.shippedAt,
        itemCount: boardRuns.itemCount,
      });
    if (!inserted) throw new Error("board_ship: snapshot insert returned no row");
    await tx.delete(boardItems).where(
      and(
        eq(boardItems.userId, userId),
        eq(boardItems.boardId, board.id),
        inArray(
          boardItems.id,
          rows.map((r) => r.id),
        ),
      ),
    );
    return inserted;
  });
  return {
    board: ref(board),
    run: { id: run.id, shippedAt: run.shippedAt.toISOString(), itemCount: run.itemCount },
    items: [],
    readiness: 0,
  };
}

// Recent launches across ALL the owner's boards, newest first; each run carries
// the name of the board it shipped from (spec 0003 + 0004).
export async function listRuns(limit = 5): Promise<HistoryOutput> {
  const userId = resolveUserId();
  const capped = Math.min(Math.max(Math.trunc(limit), 1), 20);
  const rows = await db
    .select()
    .from(boardRuns)
    .where(eq(boardRuns.userId, userId))
    .orderBy(desc(boardRuns.shippedAt))
    .limit(capped);
  return {
    runs: rows.map((r) => ({
      id: r.id,
      boardName: r.boardName,
      shippedAt: r.shippedAt.toISOString(),
      itemCount: r.itemCount,
      titles: r.items.map((i) => i.title),
    })),
  };
}
