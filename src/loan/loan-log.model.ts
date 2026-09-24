import { type Book, booksById } from "src/book/book.model";
import {
  type Assignment,
  type Project,
  sinceOf,
} from "src/project/project.model";

// "returned" covers a checked-in book whether or not the next reparto has
// closed the loan yet; "unreturned" is a loan that ended with the book out.
export type LoanRecordStatus = "reading" | "returned" | "unreturned";

export type LoanRecord = {
  // Missing when the book has since been removed from the library.
  book: Book | undefined;
  since: string;
  status: LoanRecordStatus;
  returnedOn?: string;
};

function statusOf({
  assignment,
  live,
}: {
  assignment: Assignment;
  live: boolean;
}) {
  if (assignment.returnedOn) {
    return "returned";
  }
  if (live) {
    return "reading";
  }
  return "unreturned";
}

export function loanLogOf({
  project,
  childId,
}: {
  project: Project;
  childId: string;
}) {
  const bookById = booksById(project.books);
  const recordOf = ({
    assignment,
    live,
  }: {
    assignment: Assignment;
    live: boolean;
  }): LoanRecord => ({
    book: bookById.get(assignment.bookId),
    since: sinceOf(assignment),
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
