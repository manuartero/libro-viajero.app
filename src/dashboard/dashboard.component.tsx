import { useCallback, useMemo, useState } from "react";
import { ChildCard } from "src/dashboard/child-card.component";
import { MissingSummary } from "src/dashboard/missing-summary.component";
import { NextWeekPanel } from "src/dashboard/next-week.component";
import { ReturnCounter } from "src/dashboard/return-counter.component";
import { PrimaryButton } from "src/lib/primary-button.component";
import { assignedBookByChild, type Project } from "src/project/project.model";
import styles from "./dashboard.module.css";

type DashboardProps = {
  project: Project;
};

export function Dashboard({ project }: DashboardProps) {
  const [returnedChildIds, setReturnedChildIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const toggleReturned = useCallback((childId: string) => {
    setReturnedChildIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(childId)) {
        next.add(childId);
      }
      return next;
    });
  }, []);

  const bookOfChild = useMemo(() => assignedBookByChild(project), [project]);

  const missing = project.children
    .filter((child) => !returnedChildIds.has(child.id))
    .map((child) => ({ child, book: bookOfChild.get(child.id) }));

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <p className={styles.projectName}>{project.name}</p>
        <ReturnCounter
          returned={returnedChildIds.size}
          total={project.children.length}
        />
      </header>

      <main className={styles.main}>
        <ul className={styles.grid}>
          {project.children.map((child) => (
            <li key={child.id}>
              <ChildCard
                child={child}
                book={bookOfChild.get(child.id)}
                returned={returnedChildIds.has(child.id)}
                onToggle={toggleReturned}
              />
            </li>
          ))}
        </ul>

        <MissingSummary missing={missing} />

        <NextWeekPanel project={project} returnedChildIds={returnedChildIds} />
      </main>

      <footer className={styles.footer}>
        <PrimaryButton tone="go" disabled>
          Confirmar semana
        </PrimaryButton>
        <p className={styles.footerNote}>
          Guardar la semana llega con la persistencia
        </p>
      </footer>
    </div>
  );
}
