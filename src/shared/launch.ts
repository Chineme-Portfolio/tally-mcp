import { z } from "zod";

// One source of truth for the shapes the server and the widget both use
// (code-standards.md §2). The server builds these; the widget parses them and
// builds the tool inputs.

export const LaunchItemStatus = z.enum(["todo", "active", "blocked", "done"]);
export type LaunchItemStatus = z.infer<typeof LaunchItemStatus>;

/** A task as the widget sees it (the DB timestamps are not sent). */
export const LaunchItem = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: LaunchItemStatus,
  position: z.number().int(),
});
export type LaunchItem = z.infer<typeof LaunchItem>;

/** The whole board: the tasks plus readiness (done / total, from 0 to 1). */
export const BoardState = z.object({
  items: z.array(LaunchItem),
  readiness: z.number(),
});
export type BoardState = z.infer<typeof BoardState>;

/** A mutation result: the changed item (when there is one) plus the new board. */
export const BoardStateWithItem = BoardState.extend({ item: LaunchItem });
export type BoardStateWithItem = z.infer<typeof BoardStateWithItem>;

// Tool inputs. Titles are trimmed and bounded (1 to 500 chars).
const title = z.string().trim().min(1, "title is required").max(500, "title is too long");
export const AddInput = z.object({ title });
export const EditInput = z.object({ id: z.string().uuid(), title });
export const SetStatusInput = z.object({ id: z.string().uuid(), status: LaunchItemStatus });
export const DeleteInput = z.object({ id: z.string().uuid() });
export const ReorderInput = z.object({ orderedIds: z.array(z.string().uuid()) });
