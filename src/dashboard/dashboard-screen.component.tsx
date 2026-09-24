import { Fragment, type ReactNode, useState } from "react";
import type { AppData } from "src/app-data/app-data.model";
import { booksById, librosDevueltos } from "src/book/book.model";
import { type Child, pluralPeques } from "src/child/child.model";
import { ConfirmPanel } from "src/confirm/confirm-panel.component";
import { BooklessList } from "src/dashboard/bookless-list.component";
import { EmptyCard, emptyStateFor } from "src/dashboard/empty-card.component";
import { LoanSection } from "src/dashboard/loan-section.component";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { RepartirBanner } from "src/dashboard/repartir-banner.component";
import { WeekSummary } from "src/dashboard/week-summary.component";
import {
  type ChildLoan,
  fridayLabel,
  LOAN_STATUSES,
  type LoanStatus,
  loanOf,
  loanWeeksOf,
  upcomingFridays,
} from "src/loan/loan.model";
import { Masthead } from "src/masthead/masthead.component";
import type { Tab } from "src/navigation/navigation.model";
import {
  markReturned,
  type Project,
  undoReturn,
} from "src/project/project.model";
import styles from "./dashboard-screen.module.css";

type DashboardScreenProps = {
  project: Project;
  onUpdate: (project: Project) => boolean;
  onNavigate: (tab: Tab) => void;
  onRepartir: () => void;
  onDownloadData: () => void;
  onRestoreData: (appData: AppData) => boolean;
};

function sortClass({ project, today }: { project: Project; today: Date }) {
  const loanWeeks = loanWeeksOf(project);
  const bookById = booksById(project.books);
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
  onRestoreData,
}: DashboardScreenProps) {
  const [confirmingEarly, setConfirmingEarly] = useState<ChildLoan | null>(
    null,
  );
  const emptyState = emptyStateFor({ project, onNavigate, onRepartir });
  const privacyNote = (
    <PrivacyNote
      projectName={project.name}
      onDownloadData={onDownloadData}
      onRestoreData={onRestoreData}
    />
  );

  if (emptyState) {
    return (
      <Screen name={project.name} privacyNote={privacyNote}>
        <EmptyCard {...emptyState} />
      </Screen>
    );
  }

  const { byStatus, bookless } = sortClass({ project, today: new Date() });

  const expected = [...byStatus.overdue, ...byStatus.due];
  const pending = expected.filter(({ loan }) => !loan.returnedOn);
  const upcoming = upcomingFridays(byStatus.reading);
  const freedCount = LOAN_STATUSES.flatMap((status) => byStatus[status]).filter(
    ({ loan }) => loan.returnedOn,
  ).length;

  const returnBook = (childId: string) => {
    onUpdate(markReturned({ project, childId }));
    setConfirmingEarly(null);
  };

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
    <Screen name={project.name} privacyNote={privacyNote}>
      {bookless.length > 0 && (
        <RepartirBanner
          text={`${pluralPeques(bookless.length)} sin libro`}
          onRepartir={onRepartir}
        />
      )}

      {LOAN_STATUSES.map((status) => (
        <Fragment key={status}>
          {status === "reading" && confirmingEarly && (
            <EarlyReturnConfirm
              childLoan={confirmingEarly}
              onConfirm={() => returnBook(confirmingEarly.child.id)}
              onCancel={() => setConfirmingEarly(null)}
            />
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

      {bookless.length === 0 && (
        <NextReparto freedCount={freedCount} onRepartir={onRepartir} />
      )}
    </Screen>
  );
}

function Screen({
  name,
  privacyNote,
  children,
}: {
  name: string;
  privacyNote: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.screen}>
      <Masthead name={name} after={privacyNote} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

function EarlyReturnConfirm({
  childLoan: { child, book, loan },
  onConfirm,
  onCancel,
}: {
  childLoan: ChildLoan;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmPanel
      label={`Devolución anticipada de ${child.tag}`}
      confirmText="Sí, lo devuelve"
      cancelText="No, sigue leyendo"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      «{child.tag}» tenía «{book.title}» hasta el {fridayLabel(loan.dueFriday)}.
      ¿Lo devuelve ya?
    </ConfirmPanel>
  );
}

function NextReparto({
  freedCount,
  onRepartir,
}: {
  freedCount: number;
  onRepartir: () => void;
}) {
  return (
    <>
      {freedCount > 0 && (
        <RepartirBanner
          text={librosDevueltos(freedCount)}
          onRepartir={onRepartir}
        />
      )}

      {freedCount === 0 && (
        <button
          type="button"
          className={styles.repartirAgain}
          onClick={onRepartir}
        >
          Repartir libros
        </button>
      )}
    </>
  );
}
