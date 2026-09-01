import type { Book, BookDraft } from "src/book/book.model";
import { pluralize } from "src/lib/plural";
import { BookSearch } from "src/setup/book-search.component";
import { Bookshelf } from "src/setup/bookshelf.component";
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
    <div className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          aria-label="Volver a los peques"
          onClick={onBack}
        >
          ←
        </button>
        <div className={styles.mastheadBlock}>
          <p className={styles.masthead}>{classroomName}</p>
          <p className={styles.dateline}>
            Paso 3 de 4 · Curso {yearShort} · {pluralLibros(bookList.length)}
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <BookSearch onAdd={onAdd} />
        <Bookshelf bookList={bookList} onRemove={onRemove} />
      </main>

      <footer className={styles.footer}>
        <p className={styles.progress}>
          {over > 0
            ? `Te ${over === 1 ? "sobra" : "sobran"} ${pluralLibros(over)}`
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
      </footer>
    </div>
  );
}
