// The "Clase" tab: the class list and the child builder (src/classroom/).
import type { Page } from "@playwright/test";
import { tabBar } from "./tab-bar.page";

export function createClassroomPage(page: Page) {
  const nav = tabBar(page);
  return {
    tabBar: nav,
    dateline: page.getByText(/^La clase · /),
    roster: page.getByRole("region", { name: "La lista de clase" }),
    addChildButton: page.getByRole("button", { name: "Añadir un peque" }),
    // Exact: "Sol" would otherwise also match "Girasol".
    emojiOption: (name: string) =>
      page.getByRole("radio", { name, exact: true }),
    submitChildButton: page.getByRole("button", {
      name: "Añadir peque a la clase",
    }),
    async goto() {
      await page.goto("/");
      await nav.clase.click();
    },
  };
}

export type ClassroomPage = ReturnType<typeof createClassroomPage>;
