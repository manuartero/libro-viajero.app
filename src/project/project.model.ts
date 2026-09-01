import type { Book, BookDraft } from "src/book/book.model";
import type { Child, ChildDraft } from "src/child/child.model";
import { newId } from "src/lib/id";

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

// Pure mutations. Each returns a new Project; `history` is an immutable log
// and is never touched — pruning only ever affects currentAssignments.

export function addChild({
  project,
  draft,
}: {
  project: Project;
  draft: ChildDraft;
}): Project {
  return {
    ...project,
    children: [...project.children, { ...draft, id: newId() }],
  };
}

export function saveChild({
  project,
  child,
}: {
  project: Project;
  child: Child;
}): Project {
  return {
    ...project,
    children: project.children.map((c) => (c.id === child.id ? child : c)),
  };
}

export function removeChild({
  project,
  childId,
}: {
  project: Project;
  childId: string;
}): Project {
  return {
    ...project,
    children: project.children.filter((c) => c.id !== childId),
    currentAssignments: project.currentAssignments.filter(
      (a) => a.childId !== childId,
    ),
  };
}

export function addBook({
  project,
  draft,
}: {
  project: Project;
  draft: BookDraft;
}): Project {
  return { ...project, books: [...project.books, { ...draft, id: newId() }] };
}

export function removeBook({
  project,
  bookId,
}: {
  project: Project;
  bookId: string;
}): Project {
  return {
    ...project,
    books: project.books.filter((b) => b.id !== bookId),
    currentAssignments: project.currentAssignments.filter(
      (a) => a.bookId !== bookId,
    ),
  };
}
