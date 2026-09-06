import { useId } from "react";
import type { Book } from "src/book/book.model";
import { BookCover } from "src/book/book-cover.component";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import { daysAtHomeLabel, type Loan } from "src/project/loan.model";
import styles from "./child-card.module.css";

type ChildCardProps = {
  child: Child;
  book: Book;
  loan: Loan;
  onToggle: () => void;
};

function cardClass(loan: Loan) {
  if (loan.returnedOn) {
    return `${styles.card} ${styles.returned}`;
  }
  if (loan.status === "overdue") {
    return `${styles.card} ${styles.overdue}`;
  }
  return styles.card;
}

function metaLabel(loan: Loan) {
  if (loan.returnedOn) {
    return "devuelto";
  }
  return daysAtHomeLabel(loan.daysAtHome);
}

// One tap toggles "came back". The name stays child + book so it reads the
// same in every state; how long the book has been out is the description.
export function ChildCard({ child, book, loan, onToggle }: ChildCardProps) {
  const metaId = useId();
  const returned = Boolean(loan.returnedOn);

  return (
    <button
      type="button"
      className={cardClass(loan)}
      aria-pressed={returned}
      aria-label={`${child.tag} — ${book.title}`}
      aria-describedby={metaId}
      onClick={onToggle}
    >
      {/* The child holding the book: the cover sits behind the avatar's lower
          edge, and the returned stamp lands on the cover — it is the book
          that came back. */}
      <span className={styles.figure}>
        <ChildAvatar emoji={child.emoji} color={child.color} size="large" />
        <span className={styles.coverSlot}>
          <BookCover title={book.title} coverUrl={book.coverUrl} />
          {returned && (
            <span className={styles.stamp} aria-hidden="true">
              ✓
            </span>
          )}
        </span>
      </span>
      <span className={styles.tag}>{child.tag}</span>
      <span className={styles.book}>{book.title}</span>
      <span id={metaId} className={styles.meta}>
        {metaLabel(loan)}
      </span>
    </button>
  );
}
