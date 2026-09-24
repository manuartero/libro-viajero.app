import { useId } from "react";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import styles from "./bookless-list.module.css";

type BooklessListProps = {
  childList: Child[];
  waiting: boolean;
};

export function BooklessList({ childList, waiting }: BooklessListProps) {
  const titleId = useId();

  return (
    <section className={styles.bookless} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.booklessTitle}>
        Sin libro esta semana
      </h2>
      <ul className={styles.booklessList}>
        {childList.map((child) => (
          <li key={child.id} className={styles.booklessRow}>
            <ChildAvatar child={child} size="small" />
            <span className={styles.booklessTag}>{child.tag}</span>
          </li>
        ))}
      </ul>
      {waiting && (
        <p className={styles.booklessNote}>
          Todos los libros están fuera. En cuanto vuelva uno, podrás repartirlo.
        </p>
      )}
    </section>
  );
}
