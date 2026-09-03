import { useId } from "react";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import styles from "./bookless-list.module.css";

type BooklessListProps = {
  childList: Child[];
};

// The peques a partial reparto left out. Deliberately not interactive: there
// is nothing to check in for a child who took no book home, and the check-in
// count must not include them.
export function BooklessList({ childList }: BooklessListProps) {
  const titleId = useId();

  return (
    <section className={styles.bookless} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.booklessTitle}>
        Sin libro esta semana
      </h2>
      <ul className={styles.booklessList}>
        {childList.map((child) => (
          <li key={child.id} className={styles.booklessRow}>
            <ChildAvatar emoji={child.emoji} color={child.color} size="small" />
            <span className={styles.booklessTag}>{child.tag}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
