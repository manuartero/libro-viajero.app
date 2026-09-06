// Seeds the app's "backend": the one localStorage key. The init script runs
// before the app on every navigation but only writes when the key is absent,
// so a second goto() keeps what the app itself persisted in between.
import type { Page } from "@playwright/test";
import type { Book } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import { isoDate, mondayOf } from "src/lib/week";
import type { AppData, Assignment, Project } from "src/project/project.model";

const STORAGE_KEY = "libro-viajero";

// Colors are palette members (src/palette/palette.json): Verde and Naranja.
export const RANA: Child = {
  id: "child-rana",
  tag: "Rana",
  emoji: "🐸",
  color: "#8ac926",
};
export const ZORRO: Child = {
  id: "child-zorro",
  tag: "Zorro",
  emoji: "🦊",
  color: "#f3722c",
};
export const ELMER: Book = {
  id: "book-elmer",
  title: "Elmer",
  author: "David McKee",
};

type ClassroomSeed = Partial<
  Pick<Project, "children" | "books" | "currentAssignments" | "loanWeeks">
>;

export function classroomOf({
  children = [],
  books = [],
  currentAssignments = [],
  loanWeeks,
}: ClassroomSeed = {}): AppData {
  const project: Project = {
    id: "project-caracoles",
    name: "Los Caracoles 2026/27",
    children,
    books,
    currentAssignments,
    history: [],
    loanWeeks,
  };
  return { projects: [project], activeProjectId: project.id };
}

// A book that went home `daysAgo` days ago. Three weeks back is overdue on
// any weekday and for either loan length.
export function loanFromDaysAgo({
  child,
  book,
  daysAgo,
}: {
  child: Child;
  book: Book;
  daysAgo: number;
}): Assignment {
  const since = new Date();
  since.setDate(since.getDate() - daysAgo);
  return {
    childId: child.id,
    bookId: book.id,
    weekStart: mondayOf(since),
    since: isoDate(since),
  };
}

export async function seedAppData({
  page,
  appData,
}: {
  page: Page;
  appData: AppData;
}) {
  await page.addInitScript(
    ({ key, value }) => {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, value);
      }
    },
    { key: STORAGE_KEY, value: JSON.stringify(appData) },
  );
}
