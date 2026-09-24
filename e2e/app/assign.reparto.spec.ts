import { isoDate } from "src/lib/week";
import {
  classroomOf,
  ELMER,
  loanFromDaysAgo,
  RANA,
  seedAppData,
  ZORRO,
} from "../integration/app-data.seed";
import { expect, test } from "../integration/fixtures/test.extend";
import { globalSetup } from "../integration/global.setup";

globalSetup();

test.describe("assign: reparto", () => {
  test("opens the first reparto filled in, saves it and returns to the check-in", async ({
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
    await expect.soft(assignPage.tabBar.root).toBeHidden();
    await expect.soft(assignPage.row("Rana, tiene Elmer")).toBeVisible();
    await expect
      .soft(assignPage.dateline)
      .toHaveText("El reparto · 1 de 2 con libro");

    await assignPage.loanWeeksOption("2 semanas").check();
    await assignPage.saveButton.click();

    await expect(
      dashboardPage.loanCard({ tag: "Rana", title: "Elmer" }),
    ).toBeVisible();
    await expect.soft(dashboardPage.repartirButton).toBeHidden();
    await expect
      .soft(dashboardPage.main.getByText(/Todos los libros están fuera/))
      .toBeVisible();
    await expect.soft(dashboardPage.tabBar.root).toBeVisible();
  });

  test("moves a returned book on to the next peque in the class", async ({
    page,
    dashboardPage,
    assignPage,
  }) => {
    await seedAppData({
      page,
      appData: classroomOf({
        children: [RANA, ZORRO],
        books: [ELMER],
        currentAssignments: [
          {
            ...loanFromDaysAgo({ child: RANA, book: ELMER, daysAgo: 7 }),
            returnedOn: isoDate(new Date()),
          },
        ],
      }),
    });
    await dashboardPage.goto();

    await dashboardPage.repartirButton.click();
    await expect.soft(assignPage.row("Zorro, tiene Elmer")).toBeVisible();
    await expect.soft(assignPage.row("Rana, sin libro")).toBeVisible();

    await assignPage.saveButton.click();

    await expect(
      dashboardPage.loanCard({ tag: "Zorro", title: "Elmer" }),
    ).toBeVisible();
  });
});
