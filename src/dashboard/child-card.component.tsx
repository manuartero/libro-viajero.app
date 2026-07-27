import type { Book } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import styles from "./child-card.module.css";

type ChildCardProps = {
  child: Child;
  book: Book | undefined;
  returned: boolean;
  onToggle: (childId: string) => void;
};

export function ChildCard({ child, book, returned, onToggle }: ChildCardProps) {
  return (
    <button
      type="button"
      className={returned ? `${styles.card} ${styles.returned}` : styles.card}
      aria-pressed={returned}
      aria-label={`${child.tag}${book ? ` — ${book.title}` : ""}`}
      onClick={() => onToggle(child.id)}
    >
      <span
        className={styles.avatar}
        style={{ background: child.color }}
        aria-hidden="true"
      >
        {child.emoji}
        {returned ? <span className={styles.stamp}>✓</span> : null}
      </span>
      <span className={styles.tag}>{child.tag}</span>
      <span className={styles.book}>{book ? book.title : "sin libro"}</span>
    </button>
  );
}
