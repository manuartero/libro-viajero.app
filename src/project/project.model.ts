import type { Book, BookDraft } from "src/book/book.model";
import type { Child, ChildDraft } from "src/child/child.model";
import { newId } from "src/lib/id";
import { mondayOf } from "src/lib/week";

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

// Replaces currentAssignments from a childId → bookId mapping (a reparto).
// Guarantees the assignment invariants regardless of where `pairs` came from:
// only live children and books, one book per child and one child per book
// (first child in class order wins), and an unchanged pair keeps its
// weekStart so rotation scoring stays honest — a new or changed pair starts
// counting from this week's Monday.
export function distributeBooks({
  project,
  pairs,
}: {
  project: Project;
  pairs: Record<string, string>;
}): Project {
  const weekStartOf = new Map(
    project.currentAssignments.map((a) => [
      `${a.childId}:${a.bookId}`,
      a.weekStart,
    ]),
  );
  const liveBookIds = new Set(project.books.map((b) => b.id));
  const takenBookIds = new Set<string>();
  const currentAssignments = project.children.flatMap((child) => {
    const bookId = pairs[child.id];
    if (!bookId || !liveBookIds.has(bookId) || takenBookIds.has(bookId)) {
      return [];
    }
    takenBookIds.add(bookId);
    return [
      {
        childId: child.id,
        bookId,
        weekStart: weekStartOf.get(`${child.id}:${bookId}`) ?? mondayOf(),
      },
    ];
  });
  return { ...project, currentAssignments };
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
