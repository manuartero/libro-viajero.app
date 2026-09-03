/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
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
  },
});
