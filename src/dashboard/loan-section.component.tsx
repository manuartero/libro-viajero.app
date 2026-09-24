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

const SECTION_TITLES: Record<LoanStatus, { one: string; many: string }> = {
  overdue: {
    one: "No volvió el viernes pasado",
    many: "No volvieron el viernes pasado",
  },
  due: { one: "Vuelve este viernes", many: "Vuelven este viernes" },
  reading: { one: "Sigue leyendo", many: "Siguen leyendo" },
};

function sectionTitle({
  status,
  count,
}: {
  status: LoanStatus;
  count: number;
}) {
  const { one, many } = SECTION_TITLES[status];
  if (count === 1) {
    return one;
  }
  return many;
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
            <ChildCard {...childLoan} onToggle={() => onToggle(childLoan)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
