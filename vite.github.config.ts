import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  root: "github",
  base: process.env.GITHUB_PAGES_BASE || "/gpt5.6-sol-high-codex-trashketball/",
  publicDir: "../public",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  build: {
    outDir: "../dist-pages",
    emptyOutDir: true,
    target: "es2022",
  },
});
