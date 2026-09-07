import type { Book } from "src/book/book.model";
import type { Assignment, Project } from "src/project/project.model";

// Where one loan on a child's record ended up.
//   reading    — the live assignment: the book is at home right now.
//   returned   — checked in, whether the loan has closed yet or is still
//                waiting for the next reparto.
//   unreturned — the loan ended with the book still out: a reparto or a
//                removal replaced it before the book came back.
export type LoanRecordStatus = "reading" | "returned" | "unreturned";

// One book a child took home: a line on their loan card.
export type LoanRecord = {
  // Missing when the book has since been removed from the library.
  book: Book | undefined;
  // ISO date the book went home. Assignments saved before `since` existed
  // only know their Monday, the closest thing on record.
  since: string;
  status: LoanRecordStatus;
  // ISO date the book was checked back in; only when returned.
  returnedOn?: string;
};

function statusOf({
  assignment,
  live,
}: {
  assignment: Assignment;
  live: boolean;
}): LoanRecordStatus {
  if (assignment.returnedOn) {
    return "returned";
  }
  if (live) {
    return "reading";
  }
  return "unreturned";
}

// Every book a child has taken home, newest first: the closed loans in
// history plus the live assignment, which is always the newest line.
export function loanLogOf({
  project,
  childId,
}: {
  project: Project;
  childId: string;
}): LoanRecord[] {
  const bookById = new Map(project.books.map((book) => [book.id, book]));
  const recordOf = ({
    assignment,
    live,
  }: {
    assignment: Assignment;
    live: boolean;
  }): LoanRecord => ({
    book: bookById.get(assignment.bookId),
    since: assignment.since ?? assignment.weekStart,
    status: statusOf({ assignment, live }),
    ...(assignment.returnedOn && { returnedOn: assignment.returnedOn }),
  });

  const closed = project.history
    .filter((a) => a.childId === childId)
    .map((assignment) => recordOf({ assignment, live: false }));
  const current = project.currentAssignments.find((a) => a.childId === childId);
  const live = current ? [recordOf({ assignment: current, live: true })] : [];

  return [...closed, ...live].reverse();
}
