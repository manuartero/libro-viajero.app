import {
  classroomOf,
  ELMER,
  RANA,
  seedAppData,
  ZORRO,
} from "../integration/app-data.seed";
import { expect, test } from "../integration/fixtures/test.extend";
import { globalSetup } from "../integration/global.setup";

globalSetup();

test.describe("dashboard: restore a copy", () => {
  test("warns which class goes, replaces it on confirm and keeps the old one as a backup", async ({
    page,
    dashboardPage,
  }) => {
    await seedAppData({
      page,
      appData: classroomOf({ children: [RANA], books: [ELMER] }),
    });
    const copy = classroomOf({ children: [RANA, ZORRO], books: [] });
    copy.projects[0].id = "project-anterior";
    copy.projects[0].name = "Los Caracoles 2025/26";
    await dashboardPage.goto();

    await dashboardPage.privacyNote.trigger.click();
    await dashboardPage.privacyNote.restore.trigger.click();
    await dashboardPage.privacyNote.restore.pickFile({ appData: copy });

    const preview = dashboardPage.privacyNote.restore.preview(
      "Los Caracoles 2025/26",
    );
    await expect(preview).toContainText(
      "Sustituirá a «Los Caracoles 2026/27» en este teléfono.",
    );

    await dashboardPage.privacyNote.restore.confirm.click();
    await expect(dashboardPage.privacyNote.dialog).toBeHidden();
    await expect(dashboardPage.heading).toHaveText("Los Caracoles 2025/26");

    const backedUp = await page.evaluate(() =>
      Object.keys(localStorage)
        .filter((key) => key.startsWith("libro-viajero:backup-"))
        .map((key) => JSON.parse(localStorage.getItem(key) ?? "null")),
    );
    expect(backedUp.map((data) => data.projects[0].name)).toEqual([
      "Los Caracoles 2026/27",
    ]);
  });

  test("backs out on cancel with the class untouched", async ({
    page,
    dashboardPage,
  }) => {
    await seedAppData({
      page,
      appData: classroomOf({ children: [RANA], books: [ELMER] }),
    });
    await dashboardPage.goto();

    await dashboardPage.privacyNote.trigger.click();
    await dashboardPage.privacyNote.restore.trigger.click();
    await dashboardPage.privacyNote.restore.pickFile({
      appData: classroomOf({ children: [ZORRO] }),
    });
    await dashboardPage.privacyNote.restore.cancel.click();

    await expect(dashboardPage.privacyNote.restore.trigger).toBeVisible();
    await expect.soft(dashboardPage.privacyNote.dialog).toBeVisible();
    await expect
      .soft(dashboardPage.heading)
      .toHaveText("Los Caracoles 2026/27");
  });
});
