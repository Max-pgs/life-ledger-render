/*
 * AI Usage Declaration:
 * [AI-ASSISTED: ChatGPT, 2026-08-16]
 * AI assistance was used to configure Vitest and the jsdom test environment.
 * The configuration was subsequently tested with the frontend test suite.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
  },
});