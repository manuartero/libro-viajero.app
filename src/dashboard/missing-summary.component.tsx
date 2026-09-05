import { useId } from "react";
import { bookTitleOf } from "src/book/book.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import type { MissingBook } from "src/project/project.model";
import styles from "./missing-summary.module.css";

type MissingSummaryProps = {
  missing: MissingBook[];
};

export function MissingSummary({ missing }: MissingSummaryProps) {
  const titleId = useId();

  if (missing.length === 0) {
    return (
      <section className={styles.summary}>
        <p className={styles.allBack}>¡Todos los libros han vuelto! 🎉</p>
      </section>
    );
  }

  return (
    <section className={styles.summary} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Faltan {missing.length}
      </h2>
      <ul className={styles.list}>
        {missing.map(({ child, book }) => (
          <li key={child.id} className={styles.row}>
            <span className={styles.who}>
              <ChildAvatar
                emoji={child.emoji}
                color={child.color}
                size="tiny"
              />
              {child.tag}
              <span className={styles.bookTitle}>{bookTitleOf(book)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
