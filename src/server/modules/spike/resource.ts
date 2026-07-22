import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/** The uri the spike widget resource is registered under. */
export const SPIKE_RESOURCE_URI = "ui://spike/app.html";

// Reads the widget HTML that vite-singlefile built into dist/widget/index.html.
// The whole widget (JS and CSS) is inlined into that one file, so this single
// string is the entire ui:// resource. `npm run build` (or the dev watch task)
// must have produced it before the server serves it.
export async function readSpikeWidgetHtml(): Promise<string> {
  const htmlPath = resolve(process.cwd(), "dist/widget/index.html");
  return readFile(htmlPath, "utf-8");
}
