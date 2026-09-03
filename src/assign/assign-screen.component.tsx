import { useId } from "react";
import type { AssignmentPairs, Project } from "src/project/project.model";
import { ProjectHeading } from "src/project/project-heading.component";
import styles from "./assign-screen.module.css";
import { useAssignmentDraft } from "./assignment-draft.hook";
import { AssignmentRow } from "./assignment-row.component";
import { BookTray } from "./book-tray.component";

type AssignScreenProps = {
  project: Project;
  onConfirm: (pairs: AssignmentPairs) => void;
  onBack: () => void;
};

export function AssignScreen({
  project,
  onConfirm,
  onBack,
}: AssignScreenProps) {
  const childList = project.children;
  const titleId = useId();

  const {
    pairs,
    activeChildId,
    trayBooks,
    bookById,
    assignedCount,
    assignToActive,
    unassign,
    toggleSelected,
  } = useAssignmentDraft({
    children: childList,
    books: project.books,
    currentAssignments: project.currentAssignments,
  });

  return (
    <div className={styles.screen}>
      <ProjectHeading
        name={project.name}
        // Live: this count is the only feedback that a tap landed, and it
        // changes without the teacher's focus moving anywhere near it.
        dateline={
          <span aria-live="polite">
            El reparto · {assignedCount} de {childList.length} con libro
          </span>
        }
        before={
          <button
            type="button"
            className={styles.back}
            aria-label="Volver a la semana"
            onClick={onBack}
          >
            ←
          </button>
        }
      />

      <main className={styles.main}>
        <BookTray books={trayBooks} onAssign={assignToActive} />

        <section className={styles.assignments} aria-labelledby={titleId}>
          <h2 id={titleId} className={styles.sectionTitle}>
            ¿Quién se lleva cada libro?
          </h2>
          <ul className={styles.childList}>
            {childList.map((child) => (
              <AssignmentRow
                key={child.id}
                child={child}
                book={bookById.get(pairs[child.id])}
                active={child.id === activeChildId}
                onSelect={() => toggleSelected(child.id)}
                onUnassign={() => unassign(child.id)}
              />
            ))}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.save}
          disabled={assignedCount === 0}
          onClick={() => onConfirm(pairs)}
        >
          Guardar reparto
        </button>
      </footer>
    </div>
  );
}
