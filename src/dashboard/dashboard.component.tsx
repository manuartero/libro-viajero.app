import { pluralPeques } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import { ChildCard } from "src/dashboard/child-card.component";
import { MissingSummary } from "src/dashboard/missing-summary.component";
import { NextWeekPanel } from "src/dashboard/next-week.component";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { ReturnCounter } from "src/dashboard/return-counter.component";
import type { Tab } from "src/navigation/navigation.model";
import type { MissingBook, Project } from "src/project/project.model";
import { ProjectHeading } from "src/project/project-heading.component";
import styles from "./dashboard.module.css";

type DashboardProps = {
  project: Project;
  returnedChildIds: string[];
  onToggleReturned: (childId: string) => void;
  onNavigate: (tab: Tab) => void;
  onRepartir: () => void;
  onDownloadData: () => void;
};

// The setup journey lives here as a chain of empty states: first the class
// needs children, then books, then a first reparto — then the check-in.
function emptyStateFor({
  project,
  onNavigate,
  onRepartir,
}: {
  project: Project;
  onNavigate: (tab: Tab) => void;
  onRepartir: () => void;
}) {
  if (project.children.length === 0) {
    return {
      text: "Todavía no hay peques en la clase.",
      cta: "Añadir peques",
      onCta: () => onNavigate("clase"),
    };
  }
  if (project.books.length === 0) {
    return {
      text: "La biblioteca está vacía.",
      cta: "Añadir libros",
      onCta: () => onNavigate("biblioteca"),
    };
  }
  if (project.currentAssignments.length === 0) {
    return {
      text: "Los libros esperan lector.",
      cta: "Repartir libros",
      onCta: onRepartir,
    };
  }
  return null;
}

export function Dashboard({
  project,
  returnedChildIds,
  onToggleReturned,
  onNavigate,
  onRepartir,
  onDownloadData,
}: DashboardProps) {
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
          <div className={styles.emptyCard}>
            <p className={styles.emptyText}>{emptyState.text}</p>
            <button
              type="button"
              className={styles.emptyCta}
              onClick={emptyState.onCta}
            >
              {emptyState.cta}
            </button>
          </div>
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
          <div className={styles.repartirBanner}>
            <p className={styles.repartirText}>
              {pluralPeques(unassignedCount)} sin libro
            </p>
            <button
              type="button"
              className={styles.repartirCta}
              onClick={onRepartir}
            >
              Repartir libros
            </button>
          </div>
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

        {bookless.length > 0 && (
          <section className={styles.bookless} aria-labelledby="bookless-title">
            <h2 id="bookless-title" className={styles.booklessTitle}>
              Sin libro esta semana
            </h2>
            <ul className={styles.booklessList}>
              {bookless.map((child) => (
                <li key={child.id} className={styles.booklessRow}>
                  <ChildAvatar
                    emoji={child.emoji}
                    color={child.color}
                    size="small"
                  />
                  <span className={styles.booklessTag}>{child.tag}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

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
