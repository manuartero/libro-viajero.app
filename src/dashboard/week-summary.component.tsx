import { useId } from "react";
import { pluralPeques } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import {
  type ChildLoan,
  daysAtHomeLabel,
  fridayLabel,
  type LoanStatus,
  type UpcomingFriday,
} from "src/loan/loan.model";
import styles from "./week-summary.module.css";

type WeekSummaryProps = {
  pending: ChildLoan[];
  expectedCount: number;
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
            {pending.map((childLoan) => (
              <PendingRow key={childLoan.child.id} childLoan={childLoan} />
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

function PendingRow({
  childLoan: { child, book, loan },
}: {
  childLoan: ChildLoan;
}) {
  return (
    <li className={styles.row}>
      <ChildAvatar child={child} size="tiny" />
      <span className={styles.who}>
        {child.tag}
        <span className={styles.bookTitle}>{book.title}</span>
      </span>
      <span className={metaClass(loan.status)}>
        {daysAtHomeLabel(loan.daysAtHome)}
      </span>
    </li>
  );
}
