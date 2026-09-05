import { useId } from "react";
import { pluralLibros } from "src/book/book.model";
import { ChildCard } from "src/dashboard/child-card.component";
import type { ChildLoan, LoanStatus } from "src/project/loan.model";
import styles from "./loan-section.module.css";

type LoanSectionProps = {
  status: LoanStatus;
  loans: ChildLoan[];
  returnedChildIds: ReadonlySet<string>;
  onToggle: (childId: string) => void;
};

function sectionTitle({
  status,
  count,
}: {
  status: LoanStatus;
  count: number;
}) {
  if (status === "overdue" && count === 1) {
    return "No volvió el viernes pasado";
  }
  if (status === "overdue") {
    return "No volvieron el viernes pasado";
  }
  if (status === "due" && count === 1) {
    return "Vuelve este viernes";
  }
  if (status === "due") {
    return "Vuelven este viernes";
  }
  if (count === 1) {
    return "Sigue leyendo";
  }
  return "Siguen leyendo";
}

function titleClass(status: LoanStatus) {
  if (status === "overdue") {
    return `${styles.title} ${styles.alarm}`;
  }
  return styles.title;
}

// One status, one heading, one grid. The status is the structure of the
// dashboard: the teacher reads the situation from the outline, so an empty
// status renders no section rather than a heading over nothing.
export function LoanSection({
  status,
  loans,
  returnedChildIds,
  onToggle,
}: LoanSectionProps) {
  const titleId = useId();

  if (loans.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className={titleClass(status)}>
        {sectionTitle({ status, count: loans.length })}
        <span className={styles.count}>{pluralLibros(loans.length)}</span>
      </h2>
      <ul className={styles.grid}>
        {loans.map(({ child, book, loan }) => (
          <li key={child.id}>
            <ChildCard
              child={child}
              book={book}
              loan={loan}
              returned={returnedChildIds.has(child.id)}
              onToggle={onToggle}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
