// Specs import { test, expect } from here, never from '@playwright/test'.
import { test as base } from "@playwright/test";
import { type ApiRoutes, createApiRoutes } from "../api.routes";
import { type AssignPage, createAssignPage } from "../assign.page";
import { type ClassroomPage, createClassroomPage } from "../classroom.page";
import {
  type CreateClassroomPage,
  createCreateClassroomPage,
} from "../create-classroom.page";
import { createDashboardPage, type DashboardPage } from "../dashboard.page";
import { createLibraryPage, type LibraryPage } from "../library.page";

type CustomFixtures = {
  apiRoutes: ApiRoutes;
  createClassroomPage: CreateClassroomPage;
  dashboardPage: DashboardPage;
  classroomPage: ClassroomPage;
  libraryPage: LibraryPage;
  assignPage: AssignPage;
};

export const test = base.extend<CustomFixtures>({
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
  createClassroomPage: async ({ page }, use) => {
    await use(createCreateClassroomPage(page));
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
