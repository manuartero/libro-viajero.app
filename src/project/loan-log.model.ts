import type { Book } from "src/book/book.model";
import { addDays } from "src/lib/week";
import type { Assignment, Project } from "src/project/project.model";

// Where one loan on a child's record ended up.
//   reading    — the live assignment: the book is at home right now.
//   returned   — checked in at a confirmed Friday session.
//   unreturned — sat on a confirmed session, never checked in, and is not
//                the live assignment either: a reparto or a removal replaced
//                it before the book came back.
export type LoanRecordStatus = "reading" | "returned" | "unreturned";

// One book a child took home: a line on their loan card.
export type LoanRecord = {
  // Missing when the book has since been removed from the library.
  book: Book | undefined;
  // ISO date the book went home. Assignments saved before `since` existed
  // only know their Monday, the closest thing on record.
  since: string;
  status: LoanRecordStatus;
  // ISO date of the Friday it was checked back in; only when returned.
  returnedFriday?: string;
};

// A book handed out on a given week is one loan, however many sessions it
// spans: an unreturned book keeps its assignment into the next week, so the
// same pair shows up again with the same dates.
function keyOf(assignment: Assignment) {
  return `${assignment.bookId}:${assignment.weekStart}`;
}

// Every book a child has taken home, newest first, from the confirmed
// sessions plus the live assignment. Until sessions are confirmed the log is
// the current book alone.
export function loanLogOf({
  project,
  childId,
}: {
  project: Project;
  childId: string;
}): LoanRecord[] {
  const bookById = new Map(project.books.map((book) => [book.id, book]));
  const recordOf = (assignment: Assignment): LoanRecord => ({
    book: bookById.get(assignment.bookId),
    since: assignment.since ?? assignment.weekStart,
    status: "unreturned",
  });

  // Insertion order is oldest → newest, like history itself.
  const records = new Map<string, LoanRecord>();
  for (const session of project.history) {
    const assignment = session.assignments.find((a) => a.childId === childId);
    if (!assignment) {
      continue;
    }
    const key = keyOf(assignment);
    const record = records.get(key) ?? recordOf(assignment);
    if (session.returnedChildIds.includes(childId)) {
      record.status = "returned";
      record.returnedFriday = addDays({ iso: session.weekStart, days: 4 });
    }
    records.set(key, record);
  }

  const current = project.currentAssignments.find((a) => a.childId === childId);
  if (current) {
    // Re-inserted so the live loan is always the newest line, even when it
    // was carried over from an earlier session.
    records.delete(keyOf(current));
    records.set(keyOf(current), { ...recordOf(current), status: "reading" });
  }

  return [...records.values()].reverse();
}
