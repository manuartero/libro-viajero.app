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

test.describe("assign: reparto", () => {
  test("hands a tray book to the first peque without one and returns to the check-in", async ({
    page,
    dashboardPage,
    assignPage,
  }) => {
    await seedAppData({
      page,
      appData: classroomOf({ children: [RANA, ZORRO], books: [ELMER] }),
    });
    await dashboardPage.goto();

    await dashboardPage.repartirButton.click();
    // The reparto is full-screen: the tab bar steps aside.
    await expect.soft(assignPage.tabBar.root).toBeHidden();

    await assignPage.loanWeeksOption("2 semanas").check();
    await assignPage.trayBook("Elmer").click();
    await expect
      .soft(assignPage.dateline)
      .toHaveText("El reparto · 1 de 2 con libro");
    await expect.soft(assignPage.row("Rana, tiene Elmer")).toBeVisible();

    await assignPage.saveButton.click();

    await expect(
      dashboardPage.loanCard({ tag: "Rana", title: "Elmer" }),
    ).toBeVisible();
    await expect
      .soft(dashboardPage.booklessBanner)
      .toHaveText("1 peque sin libro");
    await expect.soft(dashboardPage.tabBar.root).toBeVisible();
  });
});
