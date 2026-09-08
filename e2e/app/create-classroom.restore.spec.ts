import { classroomOf, ELMER, RANA, ZORRO } from "../integration/app-data.seed";
import { expect, test } from "../integration/fixtures/test.extend";
import { globalSetup } from "../integration/global.setup";

globalSetup();

test.describe("create classroom: restore a copy", () => {
  test("previews the copy, restores it on a new phone and keeps it across a reload", async ({
    page,
    createClassroomPage,
    dashboardPage,
  }) => {
    const copy = classroomOf({ children: [RANA, ZORRO], books: [ELMER] });
    copy.projects[0].name = "Los Caracoles 2025/26";
    await createClassroomPage.goto();

    await createClassroomPage.restore.trigger.click();
    await createClassroomPage.restore.pickFile({ appData: copy });

    const preview = createClassroomPage.restore.preview(
      "Los Caracoles 2025/26",
    );
    await expect(preview).toBeVisible();
    await expect.soft(preview).toContainText("Copia del 20 de junio de 2026");
    await expect.soft(preview).toContainText("2 peques · 1 libro");
    await expect.soft(preview).not.toContainText("Sustituirá");

    await createClassroomPage.restore.confirm.click();
    await expect(dashboardPage.heading).toHaveText("Los Caracoles 2025/26");

    await page.reload();
    await expect(dashboardPage.heading).toHaveText("Los Caracoles 2025/26");
  });

  test("turns down a file that is not a copy and offers to try another", async ({
    createClassroomPage,
  }) => {
    await createClassroomPage.goto();

    await createClassroomPage.restore.trigger.click();
    await createClassroomPage.restore.pickFile({
      appData: "{not json",
      filename: "notas.json",
    });

    await expect(createClassroomPage.restore.error).toContainText(
      "no es una copia de Libro viajero",
    );
    await expect.soft(createClassroomPage.restore.trigger).toBeVisible();
    await expect.soft(createClassroomPage.createButton).toBeVisible();
  });
});
