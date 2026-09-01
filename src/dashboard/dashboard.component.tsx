import { useState } from "react";
import type { AppTab } from "src/app.model";
import { ChildCard } from "src/dashboard/child-card.component";
import { MissingSummary } from "src/dashboard/missing-summary.component";
import { NextWeekPanel } from "src/dashboard/next-week.component";
import { ReturnCounter } from "src/dashboard/return-counter.component";
import type { Project } from "src/project/project.model";
import styles from "./dashboard.module.css";

type DashboardProps = {
  project: Project;
  onNavigate: (tab: AppTab) => void;
  onRepartir: () => void;
};

export function Dashboard({ project, onNavigate, onRepartir }: DashboardProps) {
  const [returnedChildIds, setReturnedChildIds] = useState<string[]>([]);

  const toggleReturned = (childId: string) => {
    setReturnedChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId],
    );
  };

  const bookById = new Map(project.books.map((book) => [book.id, book]));
  const bookOfChild = new Map(
    project.currentAssignments.map((a) => [a.childId, bookById.get(a.bookId)]),
  );

  const missing = project.children
    .filter((child) => !returnedChildIds.includes(child.id))
    .map((child) => ({ child, book: bookOfChild.get(child.id) }));

  const unassignedCount = project.children.filter(
    (child) => !bookOfChild.has(child.id),
  ).length;

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
        <ReturnCounter
          returned={returnedChildIds.length}
          total={project.children.length}
        />
      </header>

      <main className={styles.main}>
        {unassignedCount > 0 ? (
          <div className={styles.repartirBanner}>
            <p className={styles.repartirText}>
              {unassignedCount === 1
                ? "1 peque sin libro"
                : `${unassignedCount} peques sin libro`}
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
          {project.children.map((child) => (
            <li key={child.id}>
              <ChildCard
                child={child}
                book={bookOfChild.get(child.id)}
                returned={returnedChildIds.includes(child.id)}
                onToggle={toggleReturned}
              />
            </li>
          ))}
        </ul>

        <MissingSummary missing={missing} />

        <NextWeekPanel project={project} returnedChildIds={returnedChildIds} />
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
