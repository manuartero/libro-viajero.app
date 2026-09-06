import {
  classroomOf,
  ELMER,
  loanFromDaysAgo,
  RANA,
  seedAppData,
} from "../integration/app-data.seed";
import { expect, test } from "../integration/fixtures/test.extend";
import { globalSetup } from "../integration/global.setup";

globalSetup();

test.describe("dashboard: check-in", () => {
  test("marks a book as returned with one tap, keeps it across a reload, and undoes it with another", async ({
    page,
    dashboardPage,
  }) => {
    await seedAppData({
      page,
      appData: classroomOf({
        children: [RANA],
        books: [ELMER],
        currentAssignments: [
          loanFromDaysAgo({ child: RANA, book: ELMER, daysAgo: 21 }),
        ],
      }),
    });
    await dashboardPage.goto();

    const card = dashboardPage.loanCard({ tag: "Rana", title: "Elmer" });
    await expect(card).toBeVisible();
    await expect
      .soft(dashboardPage.loanSection(/No volvió el viernes pasado/))
      .toBeVisible();
    await expect
      .soft(dashboardPage.returnCounter)
      .toHaveAccessibleName("0 de 1 libros devueltos");

    await card.click();
    await expect
      .soft(
        dashboardPage.loanCard({ tag: "Rana", title: "Elmer", pressed: true }),
      )
      .toBeVisible();
    await expect
      .soft(dashboardPage.returnCounter)
      .toHaveAccessibleName("1 de 1 libros devueltos");

    // The return is saved on the spot, not held until some later confirm.
    await page.reload();
    await expect(
      dashboardPage.loanCard({ tag: "Rana", title: "Elmer", pressed: true }),
    ).toBeVisible();

    await card.click();
    await expect
      .soft(
        dashboardPage.loanCard({ tag: "Rana", title: "Elmer", pressed: false }),
      )
      .toBeVisible();
    await expect
      .soft(dashboardPage.returnCounter)
      .toHaveAccessibleName("0 de 1 libros devueltos");
  });
});
