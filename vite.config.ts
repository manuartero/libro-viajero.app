/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// The privacy promise, enforced by the browser rather than just stated in
// the UI: the built page may only load its own assets and talk to Open
// Library. Build-only because the React refresh preamble in dev is an
// inline script.
export const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  // Covers often answer with a 302 to archive.org and then to an
  // ia*.us.archive.org host; CSP checks every hop of the chain.
  "img-src 'self' data: https://covers.openlibrary.org https://archive.org https://*.archive.org",
  "font-src 'self'",
  "connect-src 'self' https://openlibrary.org",
  "base-uri 'none'",
  "form-action 'self'",
].join("; ");

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
