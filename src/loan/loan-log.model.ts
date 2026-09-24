import { type Book, booksById } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import { shortDateLabel } from "src/loan/loan.model";
import {
  type Assignment,
  type Project,
  sinceOf,
} from "src/project/project.model";

// "returned" covers a checked-in book whether or not the next reparto has
// closed the loan yet; "unreturned" is a loan that ended with the book out.
type LoanRecordStatus = "reading" | "returned" | "unreturned";

export type LoanDates = {
  since: string;
  status: LoanRecordStatus;
  returnedOn?: string;
};

export type LoanRecord = LoanDates & {
  // Missing when the book has since been removed from the library.
  book: Book | undefined;
};

export type ReaderRecord = LoanDates & {
  // Missing when the child has since been removed from the class.
  child: Child | undefined;
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

function loansWhere({
  project,
  belongs,
}: {
  project: Project;
  belongs: (assignment: Assignment) => boolean;
}) {
  const entryOf = ({
    assignment,
    live,
  }: {
    assignment: Assignment;
    live: boolean;
  }) => ({
    assignment,
    dates: {
      since: sinceOf(assignment),
      status: statusOf({ assignment, live }),
      ...(assignment.returnedOn && { returnedOn: assignment.returnedOn }),
    } satisfies LoanDates,
  });

  const closed = project.history
    .filter(belongs)
    .map((assignment) => entryOf({ assignment, live: false }));
  const live = project.currentAssignments
    .filter(belongs)
    .map((assignment) => entryOf({ assignment, live: true }));

  return [...closed, ...live].reverse();
}

export function loanLogOf({
  project,
  childId,
}: {
  project: Project;
  childId: string;
}) {
  const bookById = booksById(project.books);
  return loansWhere({
    project,
    belongs: (a) => a.childId === childId,
  }).map(
    ({ assignment, dates }): LoanRecord => ({
      book: bookById.get(assignment.bookId),
      ...dates,
    }),
  );
}

export function readerLogOf({
  project,
  bookId,
}: {
  project: Project;
  bookId: string;
}) {
  const childById = new Map(project.children.map((c) => [c.id, c]));
  return loansWhere({
    project,
    belongs: (a) => a.bookId === bookId,
  }).map(
    ({ assignment, dates }): ReaderRecord => ({
      child: childById.get(assignment.childId),
      ...dates,
    }),
  );
}

export function loanDatesLabel({ since, status, returnedOn }: LoanDates) {
  if (status === "returned" && returnedOn) {
    return `del ${shortDateLabel(since)} al ${shortDateLabel(returnedOn)}`;
  }
  if (status === "reading") {
    return `en casa desde el ${shortDateLabel(since)}`;
  }
  return `se lo llevó el ${shortDateLabel(since)} y no volvió`;
}
