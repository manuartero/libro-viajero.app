import type { Book, BookDraft } from "src/book/book.model";
import { BookSearch } from "src/setup/book-search.component";
import { Bookshelf } from "src/setup/bookshelf.component";
import { StepScreen } from "src/setup/step-screen.component";
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
  count === 1 ? "1 libro" : `${count} libros`;

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
    <StepScreen
      classroomName={classroomName}
      dateline={`Paso 3 de 4 · Curso ${yearShort} · ${pluralLibros(bookList.length)}`}
      backLabel="Volver a los peques"
      onBack={onBack}
      footer={
        <>
          <p className={styles.progress}>
            {over > 0
              ? `Te ${over === 1 ? "sobra 1 libro" : `sobran ${over} libros`}`
              : `${bookList.length} de ${pluralLibros(childCount)}`}
          </p>
          <button
            type="button"
            className={styles.next}
            disabled={!complete}
            onClick={onNext}
          >
            Elegir lector para cada libro →
          </button>
        </>
      }
    >
      <BookSearch onAdd={onAdd} />
      <Bookshelf bookList={bookList} onRemove={onRemove} />
    </StepScreen>
  );
}
