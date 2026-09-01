import type { Book, BookDraft } from "src/book/book.model";
import { pluralize } from "src/lib/plural";
import { PrimaryButton } from "src/lib/primary-button.component";
import { BookSearch } from "src/setup/book-search.component";
import { Bookshelf } from "src/setup/bookshelf.component";
import { StepShell } from "src/setup/step-shell.component";
import styles from "./books-step.module.css";

type BooksStepProps = {
  classroomName: string;
  yearShort: string;
  childCount: number;
  bookList: Book[];
  onBack: () => void;
  onAdd: (draft: BookDraft) => void;
  onRemove: (bookId: string) => void;
  onNext: () => void;
};

const pluralLibros = (count: number) =>
  pluralize({ count, singular: "libro", plural: "libros" });

export function BooksStep({
  classroomName,
  yearShort,
  childCount,
  bookList,
  onBack,
  onAdd,
  onRemove,
  onNext,
}: BooksStepProps) {
  const complete = bookList.length === childCount;
  const over = bookList.length - childCount;

  return (
    <StepShell
      classroomName={classroomName}
      dateline={`Paso 3 de 4 · Curso ${yearShort} · ${pluralLibros(bookList.length)}`}
      backLabel="Volver a los peques"
      onBack={onBack}
      footer={
        <>
          <p className={styles.progress}>
            {over > 0
              ? `Te ${over === 1 ? "sobra" : "sobran"} ${pluralLibros(over)}`
              : `${bookList.length} de ${pluralLibros(childCount)}`}
          </p>
          <PrimaryButton disabled={!complete} onClick={onNext}>
            Elegir lector para cada libro →
          </PrimaryButton>
        </>
      }
    >
      <BookSearch onAdd={onAdd} />
      <Bookshelf bookList={bookList} onRemove={onRemove} />
    </StepShell>
  );
}
