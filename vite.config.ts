/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { configDefaults } from "vitest/config";
// Relative on purpose: the `src` alias below does not apply to the config itself.
import { CONTENT_SECURITY_POLICY } from "./src/lib/csp";

// Build-only because the React refresh preamble in dev is an inline script.
const contentSecurityPolicy = (): Plugin => ({
  name: "libro-viajero:csp",
  apply: "build",
  transformIndexHtml: () => [
    {
      tag: "meta",
      attrs: {
        "http-equiv": "Content-Security-Policy",
        content: CONTENT_SECURITY_POLICY,
      },
      injectTo: "head-prepend",
    },
  ],
});

export default defineConfig({
  plugins: [react(), contentSecurityPolicy()],
  resolve: {
    alias: { src: new URL("./src", import.meta.url).pathname },
  },
  test: {
    environment: "jsdom",
    setupFiles: "test/setup.ts",
    projects: [
      {
        // One component/service/model in isolation. Everything that is not
        // explicitly marked as an integration test.
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}"],
          // Spread the defaults: a bare `exclude` replaces them rather than
          // merging, which would drop **/node_modules/** and **/dist/**.
          exclude: [
            ...configDefaults.exclude,
            "src/**/*.integration.test.{ts,tsx}",
          ],
        },
      },
      {
        // Render <App /> and drive full flows through localStorage. Marked by
        // filename, not by folder, so moving a file cannot silently reclassify it.
        extends: true,
        test: {
          name: "integration",
          include: ["src/**/*.integration.test.{ts,tsx}"],
        },
      },
    ],
  },
});
