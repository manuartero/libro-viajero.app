import { classroomOf, seedAppData } from "../integration/app-data.seed";
import { expect, test } from "../integration/fixtures/test.extend";
import { globalSetup } from "../integration/global.setup";

globalSetup();

test.describe("classroom: add child", () => {
  test("adds a peque from the emoji picker and keeps them across a fresh load", async ({
    page,
    classroomPage,
  }) => {
    await seedAppData({ page, appData: classroomOf() });
    await classroomPage.goto();

    await classroomPage.addChildButton.click();
    await classroomPage.emojiOption("Rana").click();
    await classroomPage.submitChildButton.click();

    const rana = classroomPage.roster.getByRole("button", {
      name: "Rana",
      exact: true,
    });
    await expect(rana).toBeVisible();
    await expect.soft(classroomPage.dateline).toHaveText("La clase · 1 peque");

    // Persistence is the feature: a new load reads the class back from storage.
    await classroomPage.goto();
    await expect.soft(rana).toBeVisible();
  });
});
