import { useId } from "react";
import { pluralLibros } from "src/book/book.model";
import { ChildCard } from "src/dashboard/child-card.component";
import type { ChildLoan, LoanStatus } from "src/loan/loan.model";
import styles from "./loan-section.module.css";

type LoanSectionProps = {
  status: LoanStatus;
  loans: ChildLoan[];
  onToggle: (childLoan: ChildLoan) => void;
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

function countLabel({
  status,
  loans,
}: {
  status: LoanStatus;
  loans: ChildLoan[];
}) {
  const returned = loans.filter(({ loan }) => loan.returnedOn).length;
  if (status === "reading") {
    return pluralLibros(loans.length);
  }
  if (loans.length === 1 && returned === 1) {
    return "devuelto";
  }
  if (loans.length === 1) {
    return "sin devolver";
  }
  return `${returned} de ${loans.length} devueltos`;
}

function countClass({
  status,
  loans,
}: {
  status: LoanStatus;
  loans: ChildLoan[];
}) {
  const allBack = loans.every(({ loan }) => loan.returnedOn);
  if (status !== "reading" && allBack) {
    return `${styles.count} ${styles.done}`;
  }
  return styles.count;
}

function titleClass(status: LoanStatus) {
  if (status === "overdue") {
    return `${styles.title} ${styles.alarm}`;
  }
  return styles.title;
}

export function LoanSection({ status, loans, onToggle }: LoanSectionProps) {
  const titleId = useId();

  if (loans.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className={titleClass(status)}>
        {sectionTitle({ status, count: loans.length })}
        <span className={countClass({ status, loans })}>
          {countLabel({ status, loans })}
        </span>
      </h2>
      <ul className={styles.grid}>
        {loans.map((childLoan) => (
          <li key={childLoan.child.id}>
            <ChildCard
              child={childLoan.child}
              book={childLoan.book}
              loan={childLoan.loan}
              onToggle={() => onToggle(childLoan)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
