import { useState } from "react";
import type { Book } from "src/book/book.model";
import { BookCover } from "src/book/book-cover.component";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import type { BookPairing, Pairing } from "src/project/project.model";
import styles from "./assign-step.module.css";

type AssignStepProps = {
  classroomName: string;
  yearShort: string;
  childList: Child[];
  bookList: Book[];
  pairs: Pairing;
  onBack: () => void;
  onAssign: (input: BookPairing) => void;
  onUnassign: (childId: string) => void;
  onCreate: () => void;
};

export function AssignStep({
  classroomName,
  yearShort,
  childList,
  bookList,
  pairs,
  onBack,
  onAssign,
  onUnassign,
  onCreate,
}: AssignStepProps) {
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
  const allAssigned = assignedCount === childList.length;

  const assignToActive = (bookId: string) => {
    if (activeChildId === null) {
      return;
    }
    onAssign({ childId: activeChildId, bookId });
    setSelectedChildId(null); // advance to the next unassigned child
  };

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          aria-label="Volver a los libros"
          onClick={onBack}
        >
          ←
        </button>
        <div className={styles.mastheadBlock}>
          <p className={styles.masthead}>{classroomName}</p>
          <p className={styles.dateline}>
            Paso 4 de 4 · Curso {yearShort} · {assignedCount} de{" "}
            {childList.length} con libro
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.tray} aria-labelledby="tray-title">
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
              const pairedBookId = pairs[child.id];
              const book = pairedBookId ? bookById.get(pairedBookId) : undefined;
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
                      onClick={() => onUnassign(child.id)}
                    >
                      ×
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.create}
          disabled={!allAssigned}
          onClick={onCreate}
        >
          Crear la clase
        </button>
      </footer>
    </div>
  );
}
