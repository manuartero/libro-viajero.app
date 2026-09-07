// Idempotent: every spec in a worker calls it.
let done = false;

export function globalSetup() {
  if (done) {
    return;
  }
  done = true;
  // Seeds compute dates in Node; playwright.config.ts gives the browser the same zone.
  process.env.TZ ??= "Europe/Madrid";
}
