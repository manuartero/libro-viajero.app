import type { Book } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import {
  addDays,
  daysBetween,
  isoDate,
  mondayOf,
  parseIsoDate,
} from "src/lib/week";
import type { Assignment, Project } from "src/project/project.model";

// How long a child keeps a book, for the whole class. Books go home on a
// Friday and come back on a Friday, so the unit is weeks and the choice is
// deliberately small: one Friday later, or two.
export type LoanWeeks = 1 | 2;

export const LOAN_WEEKS_OPTIONS: readonly LoanWeeks[] = [1, 2];

// Projects saved before the setting existed carry no value; they ran one
// week per book, which is what the app assumed until then.
export function loanWeeksOf(project: Pick<Project, "loanWeeks">): LoanWeeks {
  return project.loanWeeks ?? 1;
}

// Where an assignment stands, judged by weeks and not by days: the teacher
// checks books in on Friday, so a book due this week is "due" from Monday on,
// and only becomes "overdue" once its week is over and it is still out.
//   reading — comes back on a later Friday; nothing to do.
//   due     — comes back this Friday; the check-in covers it.
//   overdue — should have come back on a past Friday and is still out.
export type LoanStatus = "reading" | "due" | "overdue";

// Urgency order, for sorting and for the dashboard's section order.
export const LOAN_STATUSES: readonly LoanStatus[] = [
  "overdue",
  "due",
  "reading",
];

export type Loan = {
  status: LoanStatus;
  // ISO date of the Friday the book is expected back.
  dueFriday: string;
  // Whole days since the book went home. Older assignments have no `since`
  // and count from their Monday, the closest thing on record.
  daysAtHome: number;
};

// An assignment resolved for the screen: who, which book, and where the loan
// stands. Built once per render by the dashboard and handed down as is.
export type ChildLoan = {
  child: Child;
  book: Book;
  loan: Loan;
};

export function loanOf({
  assignment,
  loanWeeks,
  today,
}: {
  assignment: Assignment;
  loanWeeks: LoanWeeks;
  today: Date;
}): Loan {
  const dueWeekStart = addDays({
    iso: assignment.weekStart,
    days: 7 * loanWeeks,
  });
  return {
    status: loanStatusOf({ dueWeekStart, thisWeekStart: mondayOf(today) }),
    dueFriday: addDays({ iso: dueWeekStart, days: 4 }),
    daysAtHome: Math.max(
      0,
      daysBetween({
        from: assignment.since ?? assignment.weekStart,
        to: isoDate(today),
      }),
    ),
  };
}

// ISO dates order correctly as plain strings.
function loanStatusOf({
  dueWeekStart,
  thisWeekStart,
}: {
  dueWeekStart: string;
  thisWeekStart: string;
}): LoanStatus {
  if (thisWeekStart > dueWeekStart) {
    return "overdue";
  }
  if (thisWeekStart === dueWeekStart) {
    return "due";
  }
  return "reading";
}

// A later Friday and how many children are reading until it.
export type UpcomingFriday = {
  dueFriday: string;
  count: number;
};

// Children still reading, grouped by the Friday they are due, soonest first.
// Loans started on different weeks fall on different Fridays, so one line
// per date is the truthful summary.
export function upcomingFridays(reading: readonly ChildLoan[]) {
  const counts = new Map<string, number>();
  for (const { loan } of reading) {
    counts.set(loan.dueFriday, (counts.get(loan.dueFriday) ?? 0) + 1);
  }
  // The spread is already a fresh array, so sorting it in place mutates
  // nothing the caller can see.
  return [...counts]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dueFriday, count]): UpcomingFriday => ({ dueFriday, count }));
}

// The Friday a book handed out today would come back, for the reparto to
// spell out what "1 semana" means in dates.
export function returnFridayFor({
  loanWeeks,
  today,
}: {
  loanWeeks: LoanWeeks;
  today: Date;
}) {
  return addDays({ iso: mondayOf(today), days: 7 * loanWeeks + 4 });
}

// UI copy. Spanish, like everything the teacher reads.

export function daysAtHomeLabel(days: number) {
  if (days === 0) {
    return "desde hoy";
  }
  if (days === 1) {
    return "1 día en casa";
  }
  return `${days} días en casa`;
}

// Hoisted: constructing a DateTimeFormat is the expensive part of formatting.
const fridayFormat = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

// "viernes 18 de septiembre" — the formatter's own output carries a comma
// after the weekday that Spanish prose does not.
export function fridayLabel(iso: string) {
  return fridayFormat.format(parseIsoDate(iso)).replace(",", "");
}
