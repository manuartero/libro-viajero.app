import type { Book } from "src/book/book.model";
import { BookCover } from "src/book/book-cover.component";
import styles from "./book-tray.module.css";

type BookTrayProps = {
  books: Book[];
  onAssign: (bookId: string) => void;
};

export function BookTray({ books, onAssign }: BookTrayProps) {
  return (
    <section aria-labelledby="tray-title">
      <h2 id="tray-title" className={styles.sectionTitle}>
        Libros por repartir
      </h2>

      {books.length === 0 && (
        <p className={styles.trayDone}>¡Todos los libros repartidos! 🎉</p>
      )}

      {books.length > 0 && (
        <ul className={styles.trayList}>
          {books.map((book) => (
            <li key={book.id}>
              <button
                type="button"
                className={styles.trayBook}
                aria-label={`${book.title}, asignar`}
                onClick={() => onAssign(book.id)}
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
  );
}
