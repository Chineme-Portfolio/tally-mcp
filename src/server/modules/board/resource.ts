import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/** The uri the board widget resource is registered under (spec 0004 renamed it
 * from ui://launch/app.html; the changed uri forces the host to re fetch the
 * widget after the reconnect). */
export const BOARD_RESOURCE_URI = "ui://board/app.html";

// Reads the widget HTML that vite-singlefile built into dist/widget/index.html
// (one self contained file: JS, CSS, tokens, and the base64 fonts all inlined).
export async function readBoardWidgetHtml(): Promise<string> {
  return readFile(resolve(process.cwd(), "dist/widget/index.html"), "utf-8");
}
