import type { Book } from "src/book/book.model";
import { BookCover } from "src/book/book-cover.component";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import styles from "./assignment-row.module.css";

type AssignmentRowProps = {
  child: Child;
  book: Book | undefined;
  active: boolean;
  onSelect: () => void;
  onUnassign: () => void;
};

function rowLabel({ child, book }: { child: Child; book: Book | undefined }) {
  if (book) {
    return `${child.tag}, tiene ${book.title}`;
  }
  return `${child.tag}, sin libro`;
}

export function AssignmentRow({
  child,
  book,
  active,
  onSelect,
  onUnassign,
}: AssignmentRowProps) {
  return (
    <li className={styles.childRow}>
      <button
        type="button"
        className={styles.childButton}
        aria-pressed={active}
        aria-label={rowLabel({ child, book })}
        onClick={onSelect}
      >
        <ChildAvatar emoji={child.emoji} color={child.color} size="small" />
        <span className={styles.childTag}>{child.tag}</span>

        {book && (
          <span className={styles.childBook}>
            <BookCover
              title={book.title}
              coverUrl={book.coverUrl}
              size="small"
            />
            <span className={styles.childBookTitle}>{book.title}</span>
          </span>
        )}

        {!book && <span className={styles.noBook}>Sin libro</span>}
      </button>

      {book && (
        <button
          type="button"
          className={styles.unassign}
          aria-label={`${child.tag}, quitar libro`}
          onClick={onUnassign}
        >
          ×
        </button>
      )}
    </li>
  );
}
