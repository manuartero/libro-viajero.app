import { useState } from "react";
import { BookCover } from "src/book/book-cover.component";
import { ChildAvatar } from "src/child/child-avatar.component";
import type { Project } from "src/project/project.model";
import { Screen } from "src/screen.component";
import styles from "./assign-books.module.css";

type AssignBooksProps = {
  project: Project;
  // childId -> bookId; distributeBooks() turns it into assignments.
  onConfirm: (pairs: Record<string, string>) => void;
  onBack: () => void;
};

export function AssignBooks({ project, onConfirm, onBack }: AssignBooksProps) {
  const childList = project.children;
  const bookList = project.books;

  // childId -> bookId, seeded from the live assignments so re-entering the
  // reparto shows the current state and the teacher only adjusts.
  const [pairs, setPairs] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      project.currentAssignments.map((a) => [a.childId, a.bookId]),
    ),
  );

  // The active child receives the next tapped book. Defaults to the first
  // child without a book, so the happy path is pure alternating taps.
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
    <Screen
      masthead={project.name}
      dateline={`El reparto · ${assignedCount} de ${childList.length} con libro`}
      lead={
        <button
          type="button"
          className={styles.back}
          aria-label="Volver a la semana"
          onClick={onBack}
        >
          ←
        </button>
      }
      footer={
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
      }
    >
      <section aria-labelledby="tray-title">
        <h2 id="tray-title" className={styles.sectionTitle}>
          Libros por repartir
        </h2>
        {trayBooks.length === 0 ? (
          <p className={styles.trayDone}>¡Todos los libros repartidos! 🎉</p>
        ) : (
          <ul className={styles.trayList}>
            {trayBooks.map((book) => (
              <li key={book.id}>
                <button
                  type="button"
                  className={styles.trayBook}
                  aria-label={`${book.title}, asignar`}
                  onClick={() => assignToActive(book.id)}
                >
                  <BookCover
                    title={book.title}
                    coverUrl={book.coverUrl}
                    size="medium"
                  />
                  <span className={styles.trayTitle}>{book.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.assignments} aria-labelledby="assign-title">
        <h2 id="assign-title" className={styles.sectionTitle}>
          ¿Quién se lleva cada libro?
        </h2>
        <ul className={styles.childList}>
          {childList.map((child) => {
            const book = pairs[child.id]
              ? bookById.get(pairs[child.id])
              : undefined;
            return (
              <li key={child.id} className={styles.childRow}>
                <button
                  type="button"
                  className={styles.childButton}
                  aria-pressed={child.id === activeChildId}
                  aria-label={
                    book
                      ? `${child.tag}, tiene ${book.title}`
                      : `${child.tag}, sin libro`
                  }
                  onClick={() =>
                    setSelectedChildId((prev) =>
                      prev === child.id ? null : child.id,
                    )
                  }
                >
                  <ChildAvatar
                    emoji={child.emoji}
                    color={child.color}
                    size="small"
                  />
                  <span className={styles.childTag}>{child.tag}</span>
                  {book ? (
                    <span className={styles.childBook}>
                      <BookCover
                        title={book.title}
                        coverUrl={book.coverUrl}
                        size="small"
                      />
                      <span className={styles.childBookTitle}>
                        {book.title}
                      </span>
                    </span>
                  ) : (
                    <span className={styles.noBook}>Sin libro</span>
                  )}
                </button>
                {book ? (
                  <button
                    type="button"
                    className={styles.unassign}
                    aria-label={`${child.tag}, quitar libro`}
                    onClick={() => unassign(child.id)}
                  >
                    ×
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </Screen>
  );
}
