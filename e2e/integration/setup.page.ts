// The create-class screen: what a fresh install boots into (src/setup/).
// Describes the page — locators and intent-level helpers. No assertions here.
import type { Page } from "@playwright/test";

export function createSetupPage(page: Page) {
  return {
    nameField: page.getByLabel("¿Cómo se llama tu clase?"),
    createButton: page.getByRole("button", { name: "Crear la clase" }),
    async goto() {
      await page.goto("/");
    },
  };
}

export type SetupPage = ReturnType<typeof createSetupPage>;
