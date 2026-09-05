import { useId } from "react";
import { pluralPeques } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import {
  type ChildLoan,
  daysAtHomeLabel,
  fridayLabel,
  type LoanStatus,
  type UpcomingFriday,
} from "src/project/loan.model";
import styles from "./week-summary.module.css";

type WeekSummaryProps = {
  // Books expected back this Friday — due or overdue — not yet checked in.
  pending: ChildLoan[];
  // How many books were expected back this Friday in the first place.
  expectedCount: number;
  // Later Fridays with the number of children reading until each one.
  upcoming: UpcomingFriday[];
};

function metaClass(status: LoanStatus) {
  if (status === "overdue") {
    return `${styles.meta} ${styles.alarm}`;
  }
  return styles.meta;
}

function upcomingLabel(count: number) {
  if (count === 1) {
    return "1 peque vuelve el";
  }
  return `${pluralPeques(count)} vuelven el`;
}

// The chase list, in words: who still has to bring a book back, and when the
// rest are due. The grid above is for tapping; this is what the teacher
// reads out or types into the parents' chat.
export function WeekSummary({
  pending,
  expectedCount,
  upcoming,
}: WeekSummaryProps) {
  const titleId = useId();

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Este viernes
      </h2>

      {expectedCount === 0 && (
        <p className={styles.lead}>No toca devolver ningún libro.</p>
      )}

      {expectedCount > 0 && pending.length === 0 && (
        <p className={styles.allBack}>¡Todos los libros han vuelto! 🎉</p>
      )}

      {pending.length > 0 && (
        <>
          <p className={styles.lead}>
            Faltan {pending.length} de {expectedCount}
          </p>
          <ul className={styles.list}>
            {pending.map(({ child, book, loan }) => (
              <li key={child.id} className={styles.row}>
                <ChildAvatar
                  emoji={child.emoji}
                  color={child.color}
                  size="tiny"
                />
                <span className={styles.who}>
                  {child.tag}
                  <span className={styles.bookTitle}>{book.title}</span>
                </span>
                <span className={metaClass(loan.status)}>
                  {daysAtHomeLabel(loan.daysAtHome)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {upcoming.length > 0 && (
        <ul className={styles.upcoming}>
          {upcoming.map(({ dueFriday, count }) => (
            <li key={dueFriday} className={styles.upcomingRow}>
              {upcomingLabel(count)} {fridayLabel(dueFriday)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
