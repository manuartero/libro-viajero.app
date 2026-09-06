// Mocks the whole backend — for this app, Open Library and its covers CDN.
// Anything cross-origin that no handler claims is aborted and logged: an
// aborted request is usually a missing mock, and a silent abort turns into
// a flaky "element not found" three tests later.
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Page, Route } from "@playwright/test";

const RESPONSES_DIR = fileURLToPath(
  new URL("../api-responses", import.meta.url),
);

const OPEN_LIBRARY_ORIGIN = "https://openlibrary.org";
const COVERS_ORIGIN = "https://covers.openlibrary.org";

export type SearchVariant = "ok" | "empty" | "error";

const CONTENT_TYPES: Record<string, string> = {
  ".json": "application/json",
  ".jpg": "image/jpeg",
};

function fulfillFromFile({
  route,
  file,
  status = 200,
}: {
  route: Route;
  file: string;
  status?: number;
}) {
  return route.fulfill({
    status,
    path: path.join(RESPONSES_DIR, file),
    contentType:
      CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
  });
}

// `baseURL` is Playwright's built-in fixture — the dev server the app itself
// is served from.
export async function createApiRoutes({
  page,
  baseURL,
}: {
  page: Page;
  baseURL: string;
}) {
  const appOrigin = new URL(baseURL).origin;
  let searchVariant: SearchVariant = "ok";

  // FIRST: Playwright runs matching handlers in reverse registration order,
  // so the specific handlers below win and this one only sees what nothing
  // else claimed.
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    // The app's own bundle, CSS and fonts come from the dev server.
    if (url.origin === appOrigin || url.protocol === "data:") {
      return route.fallback();
    }
    console.warn(
      `[api-routes] aborting unmocked request: ${route.request().method()} ${url.href}`,
    );
    return route.abort("blockedbyclient");
  });

  // Variant suffix picks the file: open-library-search.json / .empty.json / .error.json
  await page.route(`${OPEN_LIBRARY_ORIGIN}/search.json*`, (route) => {
    if (searchVariant === "error") {
      return fulfillFromFile({
        route,
        file: "open-library-search.error.json",
        status: 500,
      });
    }
    if (searchVariant === "empty") {
      return fulfillFromFile({ route, file: "open-library-search.empty.json" });
    }
    return fulfillFromFile({ route, file: "open-library-search.json" });
  });

  // Every cover URL the mock JSON references → a placeholder of the same
  // size. Open Library's "-M" covers are 180 px wide. Keep the mapping
  // explicit; a regex that "matches any image" hides missing placeholders.
  await page.route(`${COVERS_ORIGIN}/b/id/*-M.jpg*`, (route) =>
    fulfillFromFile({ route, file: "image180x270.jpg" }),
  );

  return {
    search: {
      /** Swap the search response for the rest of this test. */
      respondWith(variant: SearchVariant) {
        searchVariant = variant;
      },
    },
  };
}

export type ApiRoutes = Awaited<ReturnType<typeof createApiRoutes>>;
