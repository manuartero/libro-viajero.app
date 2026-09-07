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

export type LoanWeeks = 1 | 2;

export const LOAN_WEEKS_OPTIONS: readonly LoanWeeks[] = [1, 2];

// Projects saved before the setting existed ran one week per book.
export function loanWeeksOf(project: Pick<Project, "loanWeeks">): LoanWeeks {
  return project.loanWeeks ?? 1;
}

// Judged by weeks, not days: a book is "due" from the Monday of its return
// week and "overdue" only once that week is over and it is still out.
export type LoanStatus = "reading" | "due" | "overdue";

// Urgency order; the dashboard renders its sections in this order.
export const LOAN_STATUSES: readonly LoanStatus[] = [
  "overdue",
  "due",
  "reading",
];

export type Loan = {
  status: LoanStatus;
  dueFriday: string;
  daysAtHome: number;
  // Once set, status and daysAtHome are judged on that day, not today.
  returnedOn?: string;
};

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
  const judgedOn = assignment.returnedOn
    ? parseIsoDate(assignment.returnedOn)
    : today;
  return {
    status: loanStatusOf({ dueWeekStart, thisWeekStart: mondayOf(judgedOn) }),
    dueFriday: addDays({ iso: dueWeekStart, days: 4 }),
    daysAtHome: Math.max(
      0,
      daysBetween({
        from: assignment.since ?? assignment.weekStart,
        to: isoDate(judgedOn),
      }),
    ),
    returnedOn: assignment.returnedOn,
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

export type UpcomingFriday = {
  dueFriday: string;
  count: number;
};

export function upcomingFridays(reading: readonly ChildLoan[]) {
  const counts = new Map<string, number>();
  for (const { loan } of reading) {
    counts.set(loan.dueFriday, (counts.get(loan.dueFriday) ?? 0) + 1);
  }
  return [...counts]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dueFriday, count]): UpcomingFriday => ({ dueFriday, count }));
}

export function returnFridayFor({
  loanWeeks,
  today,
}: {
  loanWeeks: LoanWeeks;
  today: Date;
}) {
  return addDays({ iso: mondayOf(today), days: 7 * loanWeeks + 4 });
}

export function daysAtHomeLabel(days: number) {
  if (days === 0) {
    return "desde hoy";
  }
  if (days === 1) {
    return "1 día en casa";
  }
  return `${days} días en casa`;
}

const fridayFormat = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

// Intl puts a comma after the weekday that Spanish prose does not.
export function fridayLabel(iso: string) {
  return fridayFormat.format(parseIsoDate(iso)).replace(",", "");
}

const shortDateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
});

export function shortDateLabel(iso: string) {
  return shortDateFormat.format(parseIsoDate(iso));
}
