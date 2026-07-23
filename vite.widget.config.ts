import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Builds the launch board widget (src/widget/launch) into ONE self contained
// HTML file at dist/widget/index.html. vite-plugin-singlefile inlines all JS,
// CSS, and the base64 fonts, so that one string is the entire ui:// resource.
const dir = import.meta.dirname;

export default defineConfig({
  root: resolve(dir, "src/widget/launch"),
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: resolve(dir, "dist/widget"),
    emptyOutDir: true,
  },
});
