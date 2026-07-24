import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type {
  BoardState,
  BoardStateWithItem,
  LaunchItem,
  LaunchItemStatus,
  ShipRun,
} from "../../../shared/launch.js";
import { db } from "../../db/client.js";
import { launchItems, launchRuns, type LaunchItemRow } from "../../db/schema.js";
import { resolveUserId } from "../../user.js";

// All access to launch_items lives here, and EVERY query filters by
// resolveUserId() (code-standards.md §5). An unscoped query is a bug.

function toItem(row: LaunchItemRow): LaunchItem {
  return { id: row.id, title: row.title, status: row.status, position: row.position };
}

async function boardState(): Promise<BoardState> {
  const userId = resolveUserId();
  const rows = await db
    .select()
    .from(launchItems)
    .where(eq(launchItems.userId, userId))
    .orderBy(asc(launchItems.position), asc(launchItems.createdAt));
  const items = rows.map(toItem);
  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const readiness = total === 0 ? 0 : done / total; // empty board reads 0, never NaN
  return { items, readiness };
}

export function listBoard(): Promise<BoardState> {
  return boardState();
}

export async function addItem(title: string): Promise<BoardStateWithItem> {
  const userId = resolveUserId();
  const rows = await db
    .select({ position: launchItems.position })
    .from(launchItems)
    .where(eq(launchItems.userId, userId));
  const nextPosition = rows.reduce((max, r) => Math.max(max, r.position), -1) + 1;
  const [row] = await db
    .insert(launchItems)
    .values({ userId, title, position: nextPosition })
    .returning();
  if (!row) throw new Error("launch_item_add: insert returned no row");
  return { item: toItem(row), ...(await boardState()) };
}

export async function editItem(id: string, title: string): Promise<BoardStateWithItem> {
  const userId = resolveUserId();
  const [row] = await db
    .update(launchItems)
    .set({ title })
    .where(and(eq(launchItems.userId, userId), eq(launchItems.id, id)))
    .returning();
  if (!row) throw new Error(`launch_item_edit: item ${id} not found`);
  return { item: toItem(row), ...(await boardState()) };
}

export async function setStatus(
  id: string,
  status: LaunchItemStatus,
): Promise<BoardStateWithItem> {
  const userId = resolveUserId();
  const [row] = await db
    .update(launchItems)
    .set({ status })
    .where(and(eq(launchItems.userId, userId), eq(launchItems.id, id)))
    .returning();
  if (!row) throw new Error(`launch_item_set_status: item ${id} not found`);
  return { item: toItem(row), ...(await boardState()) };
}

export async function deleteItem(id: string): Promise<BoardState> {
  const userId = resolveUserId();
  const removed = await db
    .delete(launchItems)
    .where(and(eq(launchItems.userId, userId), eq(launchItems.id, id)))
    .returning({ id: launchItems.id });
  if (removed.length === 0) throw new Error(`launch_item_delete: item ${id} not found`);
  return boardState();
}

export async function resetBoard(): Promise<BoardState> {
  const userId = resolveUserId();
  await db
    .update(launchItems)
    .set({ status: "todo" })
    .where(eq(launchItems.userId, userId));
  return boardState();
}

// Reorder in one transaction (all or nothing). The given order wins; any of the
// user's items missing from the list are appended in their current order;
// unknown ids are ignored (spec 0002).
export async function reorder(orderedIds: string[]): Promise<BoardState> {
  const userId = resolveUserId();
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: launchItems.id })
      .from(launchItems)
      .where(eq(launchItems.userId, userId))
      .orderBy(asc(launchItems.position), asc(launchItems.createdAt));
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
        .update(launchItems)
        .set({ position: i })
        .where(and(eq(launchItems.userId, userId), eq(launchItems.id, finalOrder[i]!)));
    }
  });
  return boardState();
}

// Ship the board (spec 0003, app only). The read, the "all done" check, the
// snapshot insert, and the delete ALL happen inside ONE transaction, and the
// delete targets only the snapshotted ids, so a task added at the same time is
// either archived with the rest or left on the board, never silently lost
// (the cross-check finding). Returns the archived run and the now empty board.
export async function shipBoard(): Promise<{ run: ShipRun } & BoardState> {
  const userId = resolveUserId();
  const run = await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(launchItems)
      .where(eq(launchItems.userId, userId))
      .orderBy(asc(launchItems.position), asc(launchItems.createdAt));
    if (rows.length === 0) throw new Error("launch_board_ship: the board is empty");
    if (!rows.every((r) => r.status === "done")) {
      throw new Error("launch_board_ship: every task must be done to ship");
    }
    const snapshot = rows.map((r) => ({
      title: r.title,
      status: r.status,
      position: r.position,
    }));
    const [inserted] = await tx
      .insert(launchRuns)
      .values({ userId, itemCount: rows.length, items: snapshot })
      .returning({
        id: launchRuns.id,
        shippedAt: launchRuns.shippedAt,
        itemCount: launchRuns.itemCount,
      });
    if (!inserted) throw new Error("launch_board_ship: snapshot insert returned no row");
    await tx.delete(launchItems).where(
      and(
        eq(launchItems.userId, userId),
        inArray(launchItems.id, rows.map((r) => r.id)),
      ),
    );
    return inserted;
  });
  return {
    run: { id: run.id, shippedAt: run.shippedAt.toISOString(), itemCount: run.itemCount },
    items: [],
    readiness: 0,
  };
}

// Recent launches, scoped, newest first (spec 0003).
export async function listRuns(
  limit = 5,
): Promise<{
  runs: Array<{ id: string; shippedAt: string; itemCount: number; titles: string[] }>;
}> {
  const userId = resolveUserId();
  const capped = Math.min(Math.max(Math.trunc(limit), 1), 20);
  const rows = await db
    .select()
    .from(launchRuns)
    .where(eq(launchRuns.userId, userId))
    .orderBy(desc(launchRuns.shippedAt))
    .limit(capped);
  return {
    runs: rows.map((r) => ({
      id: r.id,
      shippedAt: r.shippedAt.toISOString(),
      itemCount: r.itemCount,
      titles: r.items.map((i) => i.title),
    })),
  };
}

// Move one task to a target position (0 is the top). This is Claude's
// conversational reorder ("move X to the top"); the widget's drag uses reorder()
// instead. Added from real use (spec 0002 follow up).
export async function moveItem(id: string, position: number): Promise<BoardState> {
  const userId = resolveUserId();
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: launchItems.id })
      .from(launchItems)
      .where(eq(launchItems.userId, userId))
      .orderBy(asc(launchItems.position), asc(launchItems.createdAt));
    const ids = rows.map((r) => r.id);
    const from = ids.indexOf(id);
    if (from === -1) throw new Error(`launch_item_move: item ${id} not found`);
    ids.splice(from, 1);
    const target = Math.max(0, Math.min(position, ids.length));
    ids.splice(target, 0, id);
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(launchItems)
        .set({ position: i })
        .where(and(eq(launchItems.userId, userId), eq(launchItems.id, ids[i]!)));
    }
  });
  return boardState();
}
