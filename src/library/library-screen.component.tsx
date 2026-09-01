import { useState } from "react";
import type { Book } from "src/book/book.model";
import { BookSearch } from "src/library/book-search.component";
import { Bookshelf } from "src/library/bookshelf.component";
import type { Project } from "src/project/project.model";
import { addBook, removeBook } from "src/project/project.model";
import styles from "./library-screen.module.css";

type LibraryScreenProps = {
  project: Project;
  onUpdate: (project: Project) => void;
};

const pluralLibros = (count: number) =>
  count === 1 ? "1 libro" : `${count} libros`;

export function LibraryScreen({ project, onUpdate }: LibraryScreenProps) {
  // A book that is at a child's home is only removed after an explicit confirm.
  const [confirmingRemove, setConfirmingRemove] = useState<Book | null>(null);

  const readerOf = (bookId: string) => {
    const assignment = project.currentAssignments.find(
      (a) => a.bookId === bookId,
    );
    return assignment
      ? (project.children.find((c) => c.id === assignment.childId) ?? null)
      : null;
  };

  const confirmingReader = confirmingRemove
    ? readerOf(confirmingRemove.id)
    : null;

  const remove = (bookId: string) => {
    onUpdate(removeBook({ project, bookId }));
    setConfirmingRemove(null);
  };

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.mastheadBlock}>
          <p className={styles.masthead}>{project.name}</p>
          <p className={styles.dateline}>
            La biblioteca · {pluralLibros(project.books.length)}
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {confirmingRemove ? (
          <div
            className={styles.confirmPanel}
            role="alertdialog"
            aria-label={`Quitar ${confirmingRemove.title}`}
          >
            <p className={styles.confirmText}>
              «{confirmingRemove.title}» está en casa de «
              {confirmingReader?.tag}». Si lo quitas, se queda sin libro esta
              semana.
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmRemove}
                onClick={() => remove(confirmingRemove.id)}
              >
                Sí, quitarlo
              </button>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={() => setConfirmingRemove(null)}
              >
                No, mantenerlo
              </button>
            </div>
          </div>
        ) : null}

        <BookSearch onAdd={(draft) => onUpdate(addBook({ project, draft }))} />

        <Bookshelf
          bookList={project.books}
          onRemove={(bookId) => {
            if (readerOf(bookId)) {
              setConfirmingRemove(
                project.books.find((b) => b.id === bookId) ?? null,
              );
              return;
            }
            remove(bookId);
          }}
        />
      </main>
    </div>
  );
}
