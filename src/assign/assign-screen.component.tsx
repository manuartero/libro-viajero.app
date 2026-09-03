import { useState } from "react";
import type { AssignmentPairs, Project } from "src/project/project.model";
import { pairsFrom } from "src/project/project.model";
import styles from "./assign-screen.module.css";
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
  const bookList = project.books;

  const [pairs, setPairs] = useState(() =>
    pairsFrom(project.currentAssignments),
  );
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const firstUnassignedId =
    childList.find((child) => !pairs[child.id])?.id ?? null;
  const activeChildId = selectedChildId ?? firstUnassignedId;

  const assignedBookIds = new Set(Object.values(pairs));
  const trayBooks = bookList.filter((book) => !assignedBookIds.has(book.id));
  const bookById = new Map(bookList.map((book) => [book.id, book]));

  const assignedCount = childList.filter((child) => pairs[child.id]).length;

  const assignToActive = (bookId: string) => {
    if (activeChildId === null) {
      return;
    }
    setPairs((prev) => {
      const next = { ...prev };
      // One book, one child: strip the book from any other pairing.
      for (const childId of Object.keys(next)) {
        if (next[childId] === bookId) {
          delete next[childId];
        }
      }
      next[activeChildId] = bookId;
      return next;
    });
    setSelectedChildId(null); // advance to the next unassigned child
  };

  const unassign = (childId: string) => {
    setPairs((prev) => {
      const next = { ...prev };
      delete next[childId];
      return next;
    });
  };

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          aria-label="Volver a la semana"
          onClick={onBack}
        >
          ←
        </button>
        <div className={styles.mastheadBlock}>
          <p className={styles.masthead}>{project.name}</p>
          <p className={styles.dateline}>
            El reparto · {assignedCount} de {childList.length} con libro
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <BookTray books={trayBooks} onAssign={assignToActive} />

        <section className={styles.assignments} aria-labelledby="assign-title">
          <h2 id="assign-title" className={styles.sectionTitle}>
            ¿Quién se lleva cada libro?
          </h2>
          <ul className={styles.childList}>
            {childList.map((child) => (
              <AssignmentRow
                key={child.id}
                child={child}
                book={bookById.get(pairs[child.id])}
                active={child.id === activeChildId}
                onSelect={() =>
                  setSelectedChildId((prev) =>
                    prev === child.id ? null : child.id,
                  )
                }
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
