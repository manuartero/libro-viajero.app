import type { Page } from "@playwright/test";
import type { AppData } from "src/app-data/app-data.model";

// The picker is hidden behind the link; Playwright feeds the input directly.
export function restoreBackup(page: Page) {
  return {
    trigger: page.getByRole("button", { name: "Recuperar una copia" }),
    preview: (className: string) =>
      page.getByRole("region", { name: className }),
    confirm: page.getByRole("button", { name: "Sí, recuperar esta clase" }),
    cancel: page.getByRole("button", { name: "No, dejarlo como está" }),
    error: page.getByRole("alert"),
    async pickFile({
      appData,
      filename = "libro-viajero-2026-06-20.json",
    }: {
      appData: AppData | string;
      filename?: string;
    }) {
      const contents =
        typeof appData === "string" ? appData : JSON.stringify(appData);
      await page.getByLabel("Archivo de la copia").setInputFiles({
        name: filename,
        mimeType: "application/json",
        buffer: Buffer.from(contents),
      });
    },
  };
}
