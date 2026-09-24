import { useId } from "react";
import type { Book } from "src/book/book.model";
import { BookCover } from "src/book/book-cover.component";
import styles from "./bookshelf.module.css";

const trash = (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="square"
  >
    <path d="M2.5 4.5h13" />
    <path d="M6.5 4.5v-2h5v2" />
    <path d="M4 4.5l.75 11h8.5l.75-11" />
    <path d="M7.5 7.5v5M10.5 7.5v5" />
  </svg>
);

type BookshelfProps = {
  bookList: Book[];
  onRemove: (bookId: string) => void;
};

export function Bookshelf({ bookList, onRemove }: BookshelfProps) {
  const titleId = useId();

  return (
    <section className={styles.shelf} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        La estantería
      </h2>
      {bookList.length === 0 && (
        <p className={styles.empty}>Aquí irán apareciendo los libros</p>
      )}

      {bookList.length > 0 && (
        <ul className={styles.list}>
          {bookList.map((book) => (
            <li key={book.id} className={styles.row}>
              <BookCover
                title={book.title}
                coverUrl={book.coverUrl}
                size="small"
              />
              <span className={styles.text}>
                <span className={styles.bookTitle}>{book.title}</span>
                {book.author && (
                  <span className={styles.author}>{book.author}</span>
                )}
              </span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`${book.title}, quitar`}
                onClick={() => onRemove(book.id)}
              >
                {trash}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
