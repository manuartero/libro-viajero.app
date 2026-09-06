import { Fragment, useState } from "react";
import type { Child } from "src/child/child.model";
import { ConfirmPanel } from "src/confirm/confirm-panel.component";
import { BooklessList } from "src/dashboard/bookless-list.component";
import { EmptyCard, emptyStateFor } from "src/dashboard/empty-card.component";
import { LoanSection } from "src/dashboard/loan-section.component";
import { NextWeekPanel } from "src/dashboard/next-week.component";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { RepartirBanner } from "src/dashboard/repartir-banner.component";
import { ReturnCounter } from "src/dashboard/return-counter.component";
import { WeekSummary } from "src/dashboard/week-summary.component";
import type { Tab } from "src/navigation/navigation.model";
import {
  type ChildLoan,
  fridayLabel,
  LOAN_STATUSES,
  type LoanStatus,
  loanOf,
  loanWeeksOf,
  upcomingFridays,
} from "src/project/loan.model";
import {
  markReturned,
  type Project,
  undoReturn,
} from "src/project/project.model";
import { ProjectHeading } from "src/project/project-heading.component";
import styles from "./dashboard-screen.module.css";

type DashboardScreenProps = {
  project: Project;
  onUpdate: (project: Project) => boolean;
  onNavigate: (tab: Tab) => void;
  onRepartir: () => void;
  onDownloadData: () => void;
};

// One pass over the class: every child lands either in a loan bucket or in
// the bookless list. Partial repartos are allowed, so children without a
// book are listed apart and never counted; a book that no longer exists puts
// its child there too. A returned book stays in the bucket it was judged in
// on the day it came back, so the card does not jump under the finger.
function sortClass({ project, today }: { project: Project; today: Date }) {
  const loanWeeks = loanWeeksOf(project);
  const bookById = new Map(project.books.map((book) => [book.id, book]));
  const assignmentOf = new Map(
    project.currentAssignments.map((a) => [a.childId, a]),
  );
  const byStatus: Record<LoanStatus, ChildLoan[]> = {
    overdue: [],
    due: [],
    reading: [],
  };
  const bookless: Child[] = [];
  for (const child of project.children) {
    const assignment = assignmentOf.get(child.id);
    const book = assignment && bookById.get(assignment.bookId);
    if (!assignment || !book) {
      bookless.push(child);
      continue;
    }
    const loan = loanOf({ assignment, loanWeeks, today });
    byStatus[loan.status].push({ child, book, loan });
  }
  return { byStatus, bookless };
}

export function DashboardScreen({
  project,
  onUpdate,
  onNavigate,
  onRepartir,
  onDownloadData,
}: DashboardScreenProps) {
  // A child still reading whose card was tapped: the book is back before its
  // Friday, which is unusual enough to ask before recording it.
  const [confirmingEarly, setConfirmingEarly] = useState<ChildLoan | null>(
    null,
  );
  const emptyState = emptyStateFor({ project, onNavigate, onRepartir });

  if (emptyState) {
    return (
      <div className={styles.screen}>
        <ProjectHeading
          name={project.name}
          after={<PrivacyNote onDownloadData={onDownloadData} />}
        />
        <main className={styles.main}>
          <EmptyCard
            text={emptyState.text}
            cta={emptyState.cta}
            onCta={emptyState.onCta}
          />
        </main>
      </div>
    );
  }

  const { byStatus, bookless } = sortClass({ project, today: new Date() });

  // The Friday check-in covers what should be back today: books due this
  // week and books that should have been back already. A child still
  // reading is not "missing", and never counts.
  const expected = [...byStatus.overdue, ...byStatus.due];
  const pending = expected.filter(({ loan }) => !loan.returnedOn);
  const returnedCount = expected.length - pending.length;
  const upcoming = upcomingFridays(byStatus.reading);

  const returnBook = (childId: string) => {
    onUpdate(markReturned({ project, childId }));
    setConfirmingEarly(null);
  };

  // The tap on a card. On time or late it records the return outright — the
  // teacher has the book in hand. Early it asks first. On a returned card it
  // undoes, whatever the section.
  const toggle = (childLoan: ChildLoan) => {
    const { child, loan } = childLoan;
    if (loan.returnedOn) {
      onUpdate(undoReturn({ project, childId: child.id }));
      return;
    }
    if (loan.status === "reading") {
      setConfirmingEarly(childLoan);
      return;
    }
    returnBook(child.id);
  };

  return (
    <div className={styles.screen}>
      <ProjectHeading
        name={project.name}
        after={
          <div className={styles.headerTools}>
            {expected.length > 0 && (
              <ReturnCounter returned={returnedCount} total={expected.length} />
            )}
            <PrivacyNote onDownloadData={onDownloadData} />
          </div>
        }
      />

      <main className={styles.main}>
        {bookless.length > 0 && (
          <RepartirBanner
            unassignedCount={bookless.length}
            onRepartir={onRepartir}
          />
        )}

        {LOAN_STATUSES.map((status) => (
          <Fragment key={status}>
            {/* Directly above the "Sigue leyendo" grid, so it opens where the
                tap was rather than a screenful of cards away from it. */}
            {status === "reading" && confirmingEarly && (
              <ConfirmPanel
                label={`Devolución anticipada de ${confirmingEarly.child.tag}`}
                confirmText="Sí, lo devuelve"
                cancelText="No, sigue leyendo"
                onConfirm={() => returnBook(confirmingEarly.child.id)}
                onCancel={() => setConfirmingEarly(null)}
              >
                «{confirmingEarly.child.tag}» tenía «
                {confirmingEarly.book.title}» hasta el{" "}
                {fridayLabel(confirmingEarly.loan.dueFriday)}. ¿Lo devuelve ya?
              </ConfirmPanel>
            )}
            <LoanSection
              status={status}
              loans={byStatus[status]}
              onToggle={toggle}
            />
          </Fragment>
        ))}

        {bookless.length > 0 && <BooklessList childList={bookless} />}

        <WeekSummary
          pending={pending}
          expectedCount={expected.length}
          upcoming={upcoming}
        />

        <NextWeekPanel project={project} />

        {bookless.length === 0 && (
          <button
            type="button"
            className={styles.repartirAgain}
            onClick={onRepartir}
          >
            Repartir libros
          </button>
        )}
      </main>
    </div>
  );
}
