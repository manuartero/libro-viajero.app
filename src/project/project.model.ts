import type { Book } from "src/book/book.model";
import type { Child } from "src/child/child.model";

export type Assignment = {
  childId: string;
  bookId: string;
  weekStart: string; // ISO date of that week's Monday
};

export type WeeklySession = {
  weekStart: string;
  returnedChildIds: string[];
  missedChildIds: string[];
  assignments: Assignment[]; // what was current going INTO this session
};

export type Project = {
  id: string;
  name: string;
  children: Child[];
  books: Book[];
  currentAssignments: Assignment[];
  history: WeeklySession[];
};

export type AppData = {
  projects: Project[];
  activeProjectId: string | null;
};

// A child joined with their (possibly missing) current book.
export type ChildWithBook = {
  child: Child;
  book: Book | undefined;
};

// Draft childId -> bookId pairing built during setup, before weeks exist.
export type Pairing = Record<string, string>;

export type BookPairing = Omit<Assignment, "weekStart">;

export const indexChildren = (project: Project) =>
  new Map(project.children.map((child) => [child.id, child]));

export const indexBooks = (project: Project) =>
  new Map(project.books.map((book) => [book.id, book]));

export const assignedBookByChild = (project: Project) => {
  const bookById = indexBooks(project);
  return new Map(
    project.currentAssignments.map((a) => [a.childId, bookById.get(a.bookId)]),
  );
};
