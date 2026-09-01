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
  // Derived at confirmation time: every child not in returnedChildIds.
  missedChildIds: string[];
  assignments: Assignment[]; // what was current going INTO this session
};

export type Project = {
  id: string;
  name: string; // classroom name + short school year, e.g. "Clase Caracoles 2026/27"
  children: Child[];
  books: Book[];
  // Invariant: one entry per assigned child. An unreturned book keeps its
  // current assignment — the child holds it another week; only returned
  // books rotate.
  currentAssignments: Assignment[];
  history: WeeklySession[]; // past sessions, ordered oldest → newest
};

export type AppData = {
  projects: Project[];
  activeProjectId: string | null;
};
