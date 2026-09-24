import { useState } from "react";
import { type Book, pluralLibros } from "src/book/book.model";
import { ConfirmPanel } from "src/confirm/confirm-panel.component";
import { BookSearch } from "src/library/book-search.component";
import { Bookshelf } from "src/library/bookshelf.component";
import { ReaderLog } from "src/library/reader-log.component";
import { readerLogOf } from "src/loan/loan-log.model";
import { Masthead } from "src/masthead/masthead.component";
import type { Project } from "src/project/project.model";
import { addBook, removeBook } from "src/project/project.model";
import styles from "./library-screen.module.css";

type LibraryScreenProps = {
  project: Project;
  // Whether the save persisted; on false the confirm stays for a retry.
  onUpdate: (project: Project) => boolean;
};

export function LibraryScreen({ project, onUpdate }: LibraryScreenProps) {
  const [confirmingRemove, setConfirmingRemove] = useState<Book | null>(null);
  const [openBookId, setOpenBookId] = useState<string | null>(null);

  const openBook = project.books.find((b) => b.id === openBookId) ?? null;

  const toggleLog = (bookId: string) => {
    setConfirmingRemove(null);
    setOpenBookId((prev) => (prev === bookId ? null : bookId));
  };

  const readerOf = (bookId: string) => {
    const childId = project.currentAssignments.find(
      (a) => a.bookId === bookId,
    )?.childId;
    return project.children.find((c) => c.id === childId) ?? null;
  };

  const confirmingReader = confirmingRemove && readerOf(confirmingRemove.id);

  const remove = (bookId: string) => {
    if (onUpdate(removeBook({ project, bookId }))) {
      setConfirmingRemove(null);
    }
  };

  const requestRemove = (bookId: string) => {
    if (readerOf(bookId)) {
      setConfirmingRemove(project.books.find((b) => b.id === bookId) ?? null);
      return;
    }
    remove(bookId);
  };

  return (
    <div className={styles.screen}>
      <Masthead
        name={project.name}
        dateline={`La biblioteca · ${pluralLibros(project.books.length)}`}
      />

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
          openBookId={openBook?.id ?? null}
          onToggle={toggleLog}
          onRemove={requestRemove}
        >
          {openBook && (
            <ReaderLog
              key={openBook.id}
              book={openBook}
              records={readerLogOf({ project, bookId: openBook.id })}
            />
          )}
        </Bookshelf>
      </main>
    </div>
  );
}
