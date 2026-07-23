import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/** The uri the launch board widget resource is registered under. */
export const LAUNCH_RESOURCE_URI = "ui://launch/app.html";

// Reads the widget HTML that vite-singlefile built into dist/widget/index.html
// (one self contained file: JS, CSS, tokens, and the base64 fonts all inlined).
export async function readLaunchWidgetHtml(): Promise<string> {
  return readFile(resolve(process.cwd(), "dist/widget/index.html"), "utf-8");
}
