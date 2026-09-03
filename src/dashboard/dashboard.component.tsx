import type { AppTab } from "src/app.model";
import type { Book } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import { ChildCard } from "src/dashboard/child-card.component";
import { MissingSummary } from "src/dashboard/missing-summary.component";
import { NextWeekPanel } from "src/dashboard/next-week.component";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { ReturnCounter } from "src/dashboard/return-counter.component";
import { plural } from "src/lib/plural";
import type { Project } from "src/project/project.model";
import styles from "./dashboard.module.css";

type DashboardProps = {
  project: Project;
  returnedChildIds: string[];
  onToggleReturned: (childId: string) => void;
  onNavigate: (tab: AppTab) => void;
  onRepartir: () => void;
  onDownloadData: () => void;
};

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
  // One pass, because both groups answer the same question: did this child
  // take a book home? `get() === undefined` (not `has`) so an assignment
  // pointing at a book that no longer exists also lands them in `bookless`.
  const withBook: { child: Child; book: Book }[] = [];
  const bookless: Child[] = [];
  for (const child of project.children) {
    const book = bookOfChild.get(child.id);
    if (book === undefined) {
      bookless.push(child);
    } else {
      withBook.push({ child, book });
    }
  }

  const returned = new Set(returnedChildIds);
  const missing = withBook.filter(({ child }) => !returned.has(child.id));
  const returnedCount = withBook.length - missing.length;
  const unassignedCount = bookless.length;

  // The setup journey lives here as a chain of empty states: first the class
  // needs children, then books, then a first reparto — then the check-in.
  const emptyState =
    project.children.length === 0
      ? {
          text: "Todavía no hay peques en la clase.",
          cta: "Añadir peques",
          onCta: () => onNavigate("clase"),
        }
      : project.books.length === 0
        ? {
            text: "La biblioteca está vacía.",
            cta: "Añadir libros",
            onCta: () => onNavigate("biblioteca"),
          }
        : project.currentAssignments.length === 0
          ? {
              text: "Los libros esperan lector.",
              cta: "Repartir libros",
              onCta: onRepartir,
            }
          : null;

  if (emptyState) {
    return (
      <div className={styles.screen}>
        <header className={styles.header}>
          <p className={styles.projectName}>{project.name}</p>
          <PrivacyNote onDownloadData={onDownloadData} />
        </header>
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
      <header className={styles.header}>
        <p className={styles.projectName}>{project.name}</p>
        <div className={styles.headerTools}>
          <ReturnCounter returned={returnedCount} total={withBook.length} />
          <PrivacyNote onDownloadData={onDownloadData} />
        </div>
      </header>

      <main className={styles.main}>
        {unassignedCount > 0 ? (
          <div className={styles.repartirBanner}>
            <p className={styles.repartirText}>
              {plural({ count: unassignedCount, noun: "peque" })} sin libro
            </p>
            <button
              type="button"
              className={styles.repartirCta}
              onClick={onRepartir}
            >
              Repartir libros
            </button>
          </div>
        ) : null}

        <ul className={styles.grid}>
          {withBook.map(({ child, book }) => (
            <li key={child.id}>
              <ChildCard
                child={child}
                book={book}
                returned={returned.has(child.id)}
                onToggle={onToggleReturned}
              />
            </li>
          ))}
        </ul>

        {bookless.length > 0 ? (
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
        ) : null}

        <MissingSummary missing={missing} />

        <NextWeekPanel project={project} returnedChildIds={returnedChildIds} />

        {unassignedCount === 0 ? (
          <button
            type="button"
            className={styles.repartirAgain}
            onClick={onRepartir}
          >
            Repartir libros
          </button>
        ) : null}
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
