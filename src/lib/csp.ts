// vite.config.ts injects this as a <meta> on build only: the React refresh
// preamble in dev is an inline script.
export const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  // 'unsafe-inline' covers the style attributes avatars and covers take their
  // colour from; without it the built page renders them blank.
  "style-src 'self' 'unsafe-inline'",
  // Covers 302 to archive.org hosts, and CSP checks every hop.
  "img-src 'self' data: https://covers.openlibrary.org https://archive.org https://*.archive.org",
  "font-src 'self'",
  "connect-src 'self' https://openlibrary.org",
  "base-uri 'none'",
  "form-action 'self'",
].join("; ");
