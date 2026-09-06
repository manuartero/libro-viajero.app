// The full-screen "Repartir libros" flow (src/assign/). Entered from the
// dashboard, so it has no goto() of its own.
import type { Page } from "@playwright/test";
import { tabBar } from "./tab-bar.page";

export function createAssignPage(page: Page) {
  return {
    tabBar: tabBar(page),
    dateline: page.getByText(/^El reparto · /),
    loanWeeksOption: (label: "1 semana" | "2 semanas") =>
      page.getByRole("radio", { name: label }),
    trayBook: (title: string) =>
      page.getByRole("button", { name: `${title}, asignar` }),
    // A row is named "<tag>, tiene <title>" or "<tag>, sin libro".
    row: (label: string) =>
      page.getByRole("button", { name: label, exact: true }),
    saveButton: page.getByRole("button", { name: "Guardar reparto" }),
    backButton: page.getByRole("button", { name: "Volver a la semana" }),
  };
}

export type AssignPage = ReturnType<typeof createAssignPage>;
