// The "Biblioteca" tab: Open Library search and the shelf (src/library/).
import type { Page } from "@playwright/test";
import { tabBar } from "./tab-bar.page";

export function createLibraryPage(page: Page) {
  const nav = tabBar(page);
  return {
    tabBar: nav,
    dateline: page.getByText(/^La biblioteca · /),
    searchField: page.getByLabel("Busca un libro por título"),
    searchButton: page.getByRole("button", { name: "Buscar", exact: true }),
    // A result is named "<title>, <author>" — or just the title without one.
    result: (label: string) =>
      page.getByRole("button", { name: label, exact: true }),
    addedNotice: page.getByRole("status"),
    shelf: page.getByRole("region", { name: "La estantería" }),
    async goto() {
      await page.goto("/");
      await nav.biblioteca.click();
    },
  };
}

export type LibraryPage = ReturnType<typeof createLibraryPage>;
