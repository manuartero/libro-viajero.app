import { expect, test } from "../integration/fixtures/test.extend";
import { globalSetup } from "../integration/global.setup";

globalSetup();

test.describe("setup: create class", () => {
  test("names the class, stamps the school year and lands on the dashboard", async ({
    setupPage,
    dashboardPage,
  }) => {
    await setupPage.goto();

    await setupPage.nameField.fill("Los Caracoles");
    await setupPage.createButton.click();

    // Precondition for the rest: the class exists and the dashboard is up.
    await expect(dashboardPage.heading).toHaveText(
      /^Los Caracoles \d{4}\/\d{2}$/,
    );

    await expect.soft(dashboardPage.tabBar.root).toBeVisible();
    await expect
      .soft(dashboardPage.main)
      .toContainText("Todavía no hay peques en la clase.");
  });
});
