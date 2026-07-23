import { and, asc, eq } from "drizzle-orm";
import type {
  BoardState,
  BoardStateWithItem,
  LaunchItem,
  LaunchItemStatus,
} from "../../../shared/launch.js";
import { db } from "../../db/client.js";
import { launchItems, type LaunchItemRow } from "../../db/schema.js";
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
