import { expect, test } from "../integration/fixtures/test.extend";
import { globalSetup } from "../integration/global.setup";

globalSetup();

test.describe("create classroom", () => {
  test("names the class, stamps the school year and lands on the dashboard", async ({
    createClassroomPage,
    dashboardPage,
  }) => {
    await createClassroomPage.goto();

    await createClassroomPage.nameField.fill("Los Caracoles");
    await createClassroomPage.createButton.click();

    await expect(dashboardPage.heading).toHaveText(
      /^Los Caracoles \d{4}\/\d{2}$/,
    );

    await expect.soft(dashboardPage.tabBar.root).toBeVisible();
    await expect
      .soft(dashboardPage.main)
      .toContainText("Todavía no hay peques en la clase.");
  });
});
