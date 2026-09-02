import { useState } from "react";
import { ChildCard } from "src/dashboard/child-card.component";
import { MissingSummary } from "src/dashboard/missing-summary.component";
import { NextWeekPanel } from "src/dashboard/next-week.component";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { ReturnCounter } from "src/dashboard/return-counter.component";
import type { Project } from "src/project/project.model";
import styles from "./dashboard.module.css";

type DashboardProps = {
  project: Project;
  onDownloadData: () => void;
};

export function Dashboard({ project, onDownloadData }: DashboardProps) {
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

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <p className={styles.projectName}>{project.name}</p>
        <div className={styles.headerTools}>
          <ReturnCounter
            returned={returnedChildIds.length}
            total={project.children.length}
          />
          <PrivacyNote onDownloadData={onDownloadData} />
        </div>
      </header>

      <main className={styles.main}>
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
