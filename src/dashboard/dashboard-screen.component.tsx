import type { Child } from "src/child/child.model";
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
  LOAN_STATUSES,
  type LoanStatus,
  loanOf,
  loanWeeksOf,
  upcomingFridays,
} from "src/project/loan.model";
import type { Project } from "src/project/project.model";
import { ProjectHeading } from "src/project/project-heading.component";
import styles from "./dashboard-screen.module.css";

type DashboardScreenProps = {
  project: Project;
  returnedChildIds: string[];
  onToggleReturned: (childId: string) => void;
  onNavigate: (tab: Tab) => void;
  onRepartir: () => void;
  onDownloadData: () => void;
};

// One pass over the class: every child lands either in a loan bucket or in
// the bookless list. Partial repartos are allowed, so children without a
// book are listed apart and never counted; a book that no longer exists puts
// its child there too.
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
  returnedChildIds,
  onToggleReturned,
  onNavigate,
  onRepartir,
  onDownloadData,
}: DashboardScreenProps) {
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
  const returned = new Set(returnedChildIds);

  // The Friday check-in covers what should be back today: books due this
  // week and books that should have been back already. A child still
  // reading is not "missing", and never counts.
  const expected = [...byStatus.overdue, ...byStatus.due];
  const pending = expected.filter(({ child }) => !returned.has(child.id));
  const returnedCount = expected.length - pending.length;
  const upcoming = upcomingFridays(byStatus.reading);

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
          <LoanSection
            key={status}
            status={status}
            loans={byStatus[status]}
            returnedChildIds={returned}
            onToggle={onToggleReturned}
          />
        ))}

        {bookless.length > 0 && <BooklessList childList={bookless} />}

        <WeekSummary
          pending={pending}
          expectedCount={expected.length}
          upcoming={upcoming}
        />

        <NextWeekPanel project={project} returnedChildIds={returnedChildIds} />

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

      <footer className={styles.footer}>
        <button type="button" className={styles.confirm} disabled>
          Confirmar semana
        </button>
        <p className={styles.footerNote}>
          Guardar la semana llega con la persistencia
        </p>
      </footer>
    </div>
  );
}
