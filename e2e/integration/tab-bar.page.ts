// The tab bar is shared by every tabbed screen, so its locators live once.
import type { Page } from "@playwright/test";

export function tabBar(page: Page) {
  const root = page.getByRole("navigation", { name: "Secciones" });
  return {
    root,
    semana: root.getByRole("button", { name: "Semana" }),
    clase: root.getByRole("button", { name: "Clase" }),
    biblioteca: root.getByRole("button", { name: "Biblioteca" }),
  };
}
