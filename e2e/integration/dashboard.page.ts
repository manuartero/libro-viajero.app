// The "Semana" tab: the Friday check-in (src/dashboard/).
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
    // Loan sections are titled by status: "No volvió el viernes pasado",
    // "Vuelve este viernes", "Sigue leyendo" (and their plurals).
    loanSection: (title: RegExp) => page.getByRole("region", { name: title }),
    // One tap toggles "came back today"; the name is child + book in every state.
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
