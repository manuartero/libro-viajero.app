import { useState } from "react";
import { type Book, pluralLibros } from "src/book/book.model";
import { ConfirmPanel } from "src/confirm/confirm-panel.component";
import { BookSearch } from "src/library/book-search.component";
import { Bookshelf } from "src/library/bookshelf.component";
import type { Project } from "src/project/project.model";
import { addBook, removeBook } from "src/project/project.model";
import styles from "./library-screen.module.css";

type LibraryScreenProps = {
  project: Project;
  // Returns whether the update persisted; on false the screen keeps its
  // transient UI (confirm panel) so the action stays retryable.
  onUpdate: (project: Project) => boolean;
};

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

  const confirmingReader = confirmingRemove && readerOf(confirmingRemove.id);

  const remove = (bookId: string) => {
    if (onUpdate(removeBook({ project, bookId }))) {
      setConfirmingRemove(null);
    }
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
        {confirmingRemove && (
          <ConfirmPanel
            label={`Quitar ${confirmingRemove.title}`}
            confirmText="Sí, quitarlo"
            cancelText="No, mantenerlo"
            onConfirm={() => remove(confirmingRemove.id)}
            onCancel={() => setConfirmingRemove(null)}
          >
            «{confirmingRemove.title}» está en casa de «{confirmingReader?.tag}
            ». Si lo quitas, se queda sin libro esta semana.
          </ConfirmPanel>
        )}

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
