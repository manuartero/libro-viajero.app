import type { Book, BookDraft } from "src/book/book.model";
import type { Child, ChildDraft } from "src/child/child.model";
import { newId } from "src/lib/id";
import { isoDate, mondayOf } from "src/lib/week";
import type { LoanWeeks } from "src/loan/loan.model";
import type { SchoolYear } from "src/project/school-year.model";

export type Assignment = {
  childId: string;
  bookId: string;
  weekStart: string; // ISO date of that week's Monday
  // The day it actually went home; weekStart is Monday-normalised, so up to
  // six days earlier. Absent on assignments saved before this field existed.
  since?: string;
  // Set while live: checked in, waiting for the next reparto to close it.
  // Absent once closed: the loan ended with the book still out.
  returnedOn?: string;
};

export type AssignmentPairs = Record<string, string>;

export function pairsFrom(assignments: readonly Assignment[]): AssignmentPairs {
  const pairs: AssignmentPairs = {};
  for (const { childId, bookId, returnedOn } of assignments) {
    if (!returnedOn) {
      pairs[childId] = bookId;
    }
  }
  return pairs;
}

export type Project = {
  id: string;
  name: string; // classroom name + short school year, e.g. "Clase Caracoles 2026/27"
  children: Child[];
  books: Book[];
  currentAssignments: Assignment[];
  history: Assignment[]; // closed loans, oldest first, append-only
  // Absent on projects saved before it existed; read through loanWeeksOf().
  loanWeeks?: LoanWeeks;
};

export function createProject({
  classroomName,
  year,
}: {
  classroomName: string;
  year: SchoolYear;
}): Project {
  return {
    id: newId(),
    name: `${classroomName.trim()} ${year.short}`,
    children: [],
    books: [],
    currentAssignments: [],
    history: [],
  };
}

function closeLoans({
  project,
  ends,
}: {
  project: Project;
  ends: (assignment: Assignment) => boolean;
}): Project {
  const closing = project.currentAssignments.filter(ends);
  if (closing.length === 0) {
    return project;
  }
  return {
    ...project,
    currentAssignments: project.currentAssignments.filter((a) => !ends(a)),
    history: [...project.history, ...closing],
  };
}

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
  const pruned = closeLoans({ project, ends: (a) => a.childId === childId });
  return {
    ...pruned,
    children: pruned.children.filter((c) => c.id !== childId),
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

export function markReturned({
  project,
  childId,
  today = new Date(),
}: {
  project: Project;
  childId: string;
  today?: Date;
}): Project {
  return {
    ...project,
    currentAssignments: project.currentAssignments.map((a) =>
      a.childId === childId ? { ...a, returnedOn: isoDate(today) } : a,
    ),
  };
}

export function undoReturn({
  project,
  childId,
}: {
  project: Project;
  childId: string;
}): Project {
  return {
    ...project,
    currentAssignments: project.currentAssignments.map((a) => {
      if (a.childId !== childId) {
        return a;
      }
      const { returnedOn: _returnedOn, ...stillOut } = a;
      return stillOut;
    }),
  };
}

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
    if (kept && !kept.returnedOn) {
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
  const carried = new Set(currentAssignments);
  const closed = closeLoans({ project, ends: (a) => !carried.has(a) });
  return { ...closed, currentAssignments };
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
  const pruned = closeLoans({ project, ends: (a) => a.bookId === bookId });
  return {
    ...pruned,
    books: pruned.books.filter((b) => b.id !== bookId),
  };
}
