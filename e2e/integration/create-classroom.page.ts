import type { Page } from "@playwright/test";
import { restoreBackup } from "./restore-backup.page";

export function createCreateClassroomPage(page: Page) {
  return {
    nameField: page.getByLabel("¿Cómo se llama tu clase?"),
    createButton: page.getByRole("button", { name: "Crear la clase" }),
    restore: restoreBackup(page),
    async goto() {
      await page.goto("/");
    },
  };
}

export type CreateClassroomPage = ReturnType<typeof createCreateClassroomPage>;
