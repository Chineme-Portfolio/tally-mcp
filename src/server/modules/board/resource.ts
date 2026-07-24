import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const WIDGET_PATH = resolve(process.cwd(), "dist/widget/index.html");

// A short content hash of the built widget, computed once when the process
// starts (so per deploy, not per request). It goes in the ui:// uri, so the uri
// changes ONLY when the widget content changes. A changed resource uri nudges
// the host to load the new widget instead of a cached one after a redeploy
// (spec 0004 follow up: bust the host's widget cache). Falls back to "dev" if
// the widget is not built yet; the resource read then fails at request time,
// exactly as before, so nothing regresses.
function widgetVersion(): string {
  try {
    return createHash("sha256").update(readFileSync(WIDGET_PATH)).digest("hex").slice(0, 8);
  } catch {
    return "dev";
  }
}

/** The uri the board widget resource is registered under. The content hash busts
 * the host's widget cache across deploys; the tool's `_meta.ui.resourceUri` and
 * the resource registration both read this one value, so they always match. */
export const BOARD_RESOURCE_URI = `ui://board/app-${widgetVersion()}.html`;

// Reads the widget HTML that vite-singlefile built into dist/widget/index.html
// (one self contained file: JS, CSS, tokens, and the base64 fonts all inlined).
export async function readBoardWidgetHtml(): Promise<string> {
  return readFile(WIDGET_PATH, "utf-8");
}
