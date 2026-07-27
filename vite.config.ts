/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { src: new URL("./src", import.meta.url).pathname },
  },
  test: {
    environment: "jsdom",
    setupFiles: "test/setup.ts",
  },
});
