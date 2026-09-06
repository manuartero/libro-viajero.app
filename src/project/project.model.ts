import type { Book, BookDraft } from "src/book/book.model";
import type { Child, ChildDraft } from "src/child/child.model";
import { newId } from "src/lib/id";
import { isoDate, mondayOf } from "src/lib/week";
import type { LoanWeeks } from "src/project/loan.model";

export type Assignment = {
  childId: string;
  bookId: string;
  weekStart: string; // ISO date of that week's Monday
  // ISO date of the day the book actually went home, for "4 días en casa".
  // weekStart is the rotation's key and is Monday-normalised, so it can be
  // up to six days early. Missing on assignments saved before it existed.
  since?: string;
};

// A reparto in progress: childId -> bookId, before it becomes assignments.
export type AssignmentPairs = Record<string, string>;

// The inverse of distributeBooks(): flattens live assignments back into the
// editable shape, so re-entering the reparto starts from the current state.
export function pairsFrom(assignments: readonly Assignment[]): AssignmentPairs {
  const pairs: AssignmentPairs = {};
  for (const { childId, bookId } of assignments) {
    pairs[childId] = bookId;
  }
  return pairs;
}

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
  // How many Fridays a book stays out, for every child alike. Optional
  // because projects saved before it existed have none; read it through
  // loanWeeksOf(), never directly.
  loanWeeks?: LoanWeeks;
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
// (first child in class order wins), and an unchanged pair keeps its dates
// so rotation scoring and "días en casa" stay honest — a new or changed pair
// starts counting from today.
export function distributeBooks({
  project,
  pairs,
  today = new Date(),
}: {
  project: Project;
  pairs: AssignmentPairs;
  today?: Date;
}): Project {
  const existing = new Map(
    project.currentAssignments.map((a) => [`${a.childId}:${a.bookId}`, a]),
  );
  const liveBookIds = new Set(project.books.map((b) => b.id));
  const takenBookIds = new Set<string>();
  const currentAssignments = project.children.flatMap((child) => {
    const bookId = pairs[child.id];
    if (!bookId || !liveBookIds.has(bookId) || takenBookIds.has(bookId)) {
      return [];
    }
    takenBookIds.add(bookId);
    const kept = existing.get(`${child.id}:${bookId}`);
    if (kept) {
      return [kept];
    }
    return [
      {
        childId: child.id,
        bookId,
        weekStart: mondayOf(today),
        since: isoDate(today),
      },
    ];
  });
  return { ...project, currentAssignments };
}

export function setLoanWeeks({
  project,
  loanWeeks,
}: {
  project: Project;
  loanWeeks: LoanWeeks;
}): Project {
  return { ...project, loanWeeks };
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
