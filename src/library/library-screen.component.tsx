import { useState } from "react";
import type { Book } from "src/book/book.model";
import { ConfirmRemove } from "src/confirm-remove.component";
import { plural } from "src/lib/plural";
import { BookSearch } from "src/library/book-search.component";
import { Bookshelf } from "src/library/bookshelf.component";
import type { Project } from "src/project/project.model";
import { addBook, removeBook } from "src/project/project.model";
import { Screen } from "src/screen.component";

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

  const remove = (bookId: string) => {
    if (onUpdate(removeBook({ project, bookId }))) {
      setConfirmingRemove(null);
    }
  };

  return (
    <Screen
      masthead={project.name}
      dateline={`La biblioteca · ${plural({ count: project.books.length, noun: "libro" })}`}
    >
      {confirmingRemove ? (
        <ConfirmRemove
          label={`Quitar ${confirmingRemove.title}`}
          onConfirm={() => remove(confirmingRemove.id)}
          onCancel={() => setConfirmingRemove(null)}
        >
          «{confirmingRemove.title}» está en casa de «
          {readerOf(confirmingRemove.id)?.tag}». Si lo quitas, se queda sin
          libro esta semana.
        </ConfirmRemove>
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
    </Screen>
  );
}
