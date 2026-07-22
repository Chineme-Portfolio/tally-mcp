import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Builds the spike widget (src/widget/spike) into ONE self contained HTML file
// at dist/widget/index.html. vite-plugin-singlefile inlines all JS and CSS, so
// that one string is the entire ui:// resource the server serves.
const dir = import.meta.dirname;

export default defineConfig({
  root: resolve(dir, "src/widget/spike"),
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: resolve(dir, "dist/widget"),
    emptyOutDir: true,
  },
});
