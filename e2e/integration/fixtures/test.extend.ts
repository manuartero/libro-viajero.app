// Every spec imports { test, expect } from here — never from
// '@playwright/test' directly.
import { test as base } from "@playwright/test";
import { type ApiRoutes, createApiRoutes } from "../api.routes";
import { type AssignPage, createAssignPage } from "../assign.page";
import { type ClassroomPage, createClassroomPage } from "../classroom.page";
import { createDashboardPage, type DashboardPage } from "../dashboard.page";
import { createLibraryPage, type LibraryPage } from "../library.page";
import { createSetupPage, type SetupPage } from "../setup.page";

type CustomFixtures = {
  apiRoutes: ApiRoutes;
  setupPage: SetupPage;
  dashboardPage: DashboardPage;
  classroomPage: ClassroomPage;
  libraryPage: LibraryPage;
  assignPage: AssignPage;
};

export const test = base.extend<CustomFixtures>({
  // `auto: true` — the backend is mocked in every test, even one that never
  // names `apiRoutes`.
  apiRoutes: [
    async ({ page, baseURL }, use) => {
      const api = await createApiRoutes({
        page,
        baseURL: baseURL ?? "http://localhost:5173",
      });
      await use(api);
    },
    { auto: true },
  ],
  setupPage: async ({ page }, use) => {
    await use(createSetupPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(createDashboardPage(page));
  },
  classroomPage: async ({ page }, use) => {
    await use(createClassroomPage(page));
  },
  libraryPage: async ({ page }, use) => {
    await use(createLibraryPage(page));
  },
  assignPage: async ({ page }, use) => {
    await use(createAssignPage(page));
  },
});

export { expect } from "@playwright/test";
