import type { Book } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
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
      <ChildAvatar emoji={child.emoji} color={child.color}>
        {returned ? <span className={styles.stamp}>✓</span> : null}
      </ChildAvatar>
      <span className={styles.tag}>{child.tag}</span>
      <span className={styles.book}>{book ? book.title : "sin libro"}</span>
    </button>
  );
}
