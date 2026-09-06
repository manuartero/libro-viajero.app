// Called at module level in every spec. Must be idempotent: fullyParallel
// runs it once per worker, and every spec in that worker calls it again.
let done = false;

export function globalSetup() {
  if (done) {
    return;
  }
  done = true;
  // Seeds compute "days ago" in Node; the browser runs in the same zone via
  // `timezoneId` in playwright.config.ts, so both sides agree on the date.
  process.env.TZ ??= "Europe/Madrid";
}
