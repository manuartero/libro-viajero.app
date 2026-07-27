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
