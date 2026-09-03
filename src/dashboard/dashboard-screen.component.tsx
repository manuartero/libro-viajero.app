import { BooklessList } from "src/dashboard/bookless-list.component";
import { ChildCard } from "src/dashboard/child-card.component";
import { EmptyCard, emptyStateFor } from "src/dashboard/empty-card.component";
import { MissingSummary } from "src/dashboard/missing-summary.component";
import { NextWeekPanel } from "src/dashboard/next-week.component";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { RepartirBanner } from "src/dashboard/repartir-banner.component";
import { ReturnCounter } from "src/dashboard/return-counter.component";
import type { Tab } from "src/navigation/navigation.model";
import type { MissingBook, Project } from "src/project/project.model";
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

export function DashboardScreen({
  project,
  returnedChildIds,
  onToggleReturned,
  onNavigate,
  onRepartir,
  onDownloadData,
}: DashboardScreenProps) {
  const bookById = new Map(project.books.map((book) => [book.id, book]));
  const bookOfChild = new Map(
    project.currentAssignments.map((a) => [a.childId, bookById.get(a.bookId)]),
  );

  // Partial repartos are allowed, so the check-in only covers children who
  // actually took a book home; the rest are listed apart and never counted.
  // `get() === undefined` (not `has`) so an assignment pointing at a book
  // that no longer exists also lands the child in the bookless group.
  const withBook = project.children.filter(
    (child) => bookOfChild.get(child.id) !== undefined,
  );
  const bookless = project.children.filter(
    (child) => bookOfChild.get(child.id) === undefined,
  );

  const returnedCount = withBook.filter((child) =>
    returnedChildIds.includes(child.id),
  ).length;

  const missing: MissingBook[] = withBook
    .filter((child) => !returnedChildIds.includes(child.id))
    .map((child) => ({ child, book: bookOfChild.get(child.id) }));

  const unassignedCount = bookless.length;

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

  return (
    <div className={styles.screen}>
      <ProjectHeading
        name={project.name}
        after={
          <div className={styles.headerTools}>
            <ReturnCounter returned={returnedCount} total={withBook.length} />
            <PrivacyNote onDownloadData={onDownloadData} />
          </div>
        }
      />

      <main className={styles.main}>
        {unassignedCount > 0 && (
          <RepartirBanner
            unassignedCount={unassignedCount}
            onRepartir={onRepartir}
          />
        )}

        <ul className={styles.grid}>
          {withBook.map((child) => (
            <li key={child.id}>
              <ChildCard
                child={child}
                book={bookOfChild.get(child.id)}
                returned={returnedChildIds.includes(child.id)}
                onToggle={onToggleReturned}
              />
            </li>
          ))}
        </ul>

        {bookless.length > 0 && <BooklessList childList={bookless} />}

        <MissingSummary missing={missing} />

        <NextWeekPanel project={project} returnedChildIds={returnedChildIds} />

        {unassignedCount === 0 && (
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
