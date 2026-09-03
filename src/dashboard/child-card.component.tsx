import { type Book, bookTitleOf } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import styles from "./child-card.module.css";

type ChildCardProps = {
  child: Child;
  book: Book | undefined;
  returned: boolean;
  onToggle: (childId: string) => void;
};

function cardClass(returned: boolean) {
  if (returned) {
    return `${styles.card} ${styles.returned}`;
  }
  return styles.card;
}

function cardLabel({ tag, book }: { tag: string; book: Book | undefined }) {
  if (!book) {
    return tag;
  }
  return `${tag} — ${book.title}`;
}

export function ChildCard({ child, book, returned, onToggle }: ChildCardProps) {
  return (
    <button
      type="button"
      className={cardClass(returned)}
      aria-pressed={returned}
      aria-label={cardLabel({ tag: child.tag, book })}
      onClick={() => onToggle(child.id)}
    >
      <ChildAvatar emoji={child.emoji} color={child.color}>
        {returned && <span className={styles.stamp}>✓</span>}
      </ChildAvatar>
      <span className={styles.tag}>{child.tag}</span>
      <span className={styles.book}>{bookTitleOf(book)}</span>
    </button>
  );
}
