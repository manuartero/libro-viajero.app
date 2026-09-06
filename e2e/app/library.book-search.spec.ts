import { classroomOf, RANA, seedAppData } from "../integration/app-data.seed";
import { expect, test } from "../integration/fixtures/test.extend";
import { globalSetup } from "../integration/global.setup";

globalSetup();

test.describe("library: book search", () => {
  test("finds a title in Open Library and puts it on the shelf", async ({
    page,
    libraryPage,
  }) => {
    await seedAppData({ page, appData: classroomOf({ children: [RANA] }) });
    await libraryPage.goto();

    await libraryPage.searchField.fill("Elmer");
    await libraryPage.searchButton.click();

    const elmer = libraryPage.result("Elmer, David McKee");
    await expect(elmer).toBeVisible();
    await elmer.click();

    await expect
      .soft(libraryPage.addedNotice)
      .toHaveText("«Elmer» añadido a la estantería");
    await expect.soft(libraryPage.shelf).toContainText("Elmer");
    await expect
      .soft(libraryPage.dateline)
      .toHaveText("La biblioteca · 1 libro");
  });
});
