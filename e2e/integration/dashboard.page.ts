import type { Page } from "@playwright/test";
import { tabBar } from "./tab-bar.page";

export function createDashboardPage(page: Page) {
  return {
    tabBar: tabBar(page),
    heading: page.getByRole("heading", { level: 1 }),
    main: page.getByRole("main"),
    repartirButton: page.getByRole("button", { name: "Repartir libros" }),
    returnCounter: page.getByRole("status", { name: /libros devueltos/ }),
    booklessBanner: page.getByText(/peques? sin libro/),
    returnedBanner: page.getByText(/^\d+ libros? devueltos?$/),
    loanSection: (title: RegExp) => page.getByRole("region", { name: title }),
    loanCard: ({
      tag,
      title,
      pressed,
    }: {
      tag: string;
      title: string;
      pressed?: boolean;
    }) =>
      page.getByRole("button", {
        name: `${tag} — ${title}`,
        exact: true,
        pressed,
      }),
    async goto() {
      await page.goto("/");
    },
  };
}

export type DashboardPage = ReturnType<typeof createDashboardPage>;
