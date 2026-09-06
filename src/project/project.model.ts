import type { Book, BookDraft } from "src/book/book.model";
import type { Child, ChildDraft } from "src/child/child.model";
import { newId } from "src/lib/id";
import { isoDate, mondayOf } from "src/lib/week";
import type { LoanWeeks } from "src/project/loan.model";

// One loan: a book at one child's home. Live while it sits in
// currentAssignments; closed once it moves to history.
export type Assignment = {
  childId: string;
  bookId: string;
  weekStart: string; // ISO date of that week's Monday
  // ISO date of the day the book actually went home, for "4 días en casa".
  // weekStart is the rotation's key and is Monday-normalised, so it can be
  // up to six days early. Missing on assignments saved before it existed.
  since?: string;
  // ISO date of the day the book came back. A live assignment with it set is
  // a book checked in and waiting for the next reparto to hand it on; a
  // closed one without it is a loan that ended with the book still out.
  returnedOn?: string;
};

// A reparto in progress: childId -> bookId, before it becomes assignments.
export type AssignmentPairs = Record<string, string>;

// The inverse of distributeBooks(): flattens live assignments back into the
// editable shape, so re-entering the reparto starts from the current state.
// A returned book is not paired any more — it goes back on the tray and its
// reader's row starts empty, which is what the reparto after a check-in is
// for.
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
  // Invariant: one entry per assigned child. An unreturned book keeps its
  // current assignment — the child holds it another week; only returned
  // books rotate, and they rotate at the next reparto, which is when a
  // returned assignment leaves this list.
  currentAssignments: Assignment[];
  // Every loan that ended, oldest → newest: returned ones with their
  // returnedOn, and ones dissolved with the book still out (a reparto moved
  // on, the child or the book left) without. The class-list loan card reads
  // it; nothing ever edits an entry.
  history: Assignment[];
  // How many Fridays a book stays out, for every child alike. Optional
  // because projects saved before it existed have none; read it through
  // loanWeeksOf(), never directly.
  loanWeeks?: LoanWeeks;
};

export type AppData = {
  projects: Project[];
  activeProjectId: string | null;
};

// Pure mutations. Each returns a new Project; `history` is an append-only
// log — an assignment leaving currentAssignments for any reason is closed
// into it, never dropped.

// Moves every live assignment that `ends` out of currentAssignments and onto
// the end of history, in class order.
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

// The check-in tap: the child handed the book back today. The assignment
// stays live so the card keeps its place and a second tap can undo it; the
// next reparto is what closes the loan.
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

// Replaces currentAssignments from a childId → bookId mapping (a reparto).
// Guarantees the assignment invariants regardless of where `pairs` came from:
// only live children and books, one book per child and one child per book
// (first child in class order wins), and an unchanged pair keeps its dates
// so rotation scoring and "días en casa" stay honest — a new or changed pair
// starts counting from today. A returned book is never carried over, even
// to the same child: that loan is done and goes to history along with every
// pairing the reparto replaced.
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
