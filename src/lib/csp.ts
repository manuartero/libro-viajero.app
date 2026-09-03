// The privacy promise, enforced by the browser rather than just stated in
// the UI: the built page may only load its own assets and talk to Open
// Library. vite.config.ts injects it as a <meta> on build only, because the
// React refresh preamble in dev is an inline script.
export const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  // 'unsafe-inline' also covers style *attributes*: avatars, palette swatches
  // and placeholder covers take their colour from `style={{ background }}`.
  // Without it the built page renders them blank while dev and tests stay
  // green, because the policy is only injected on build.
  "style-src 'self' 'unsafe-inline'",
  // Covers often answer with a 302 to archive.org and then to an
  // ia*.us.archive.org host; CSP checks every hop of the chain.
  "img-src 'self' data: https://covers.openlibrary.org https://archive.org https://*.archive.org",
  "font-src 'self'",
  "connect-src 'self' https://openlibrary.org",
  "base-uri 'none'",
  "form-action 'self'",
].join("; ");
