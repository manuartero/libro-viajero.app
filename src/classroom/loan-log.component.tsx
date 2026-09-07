import { useCallback, useId } from "react";
import type { Book } from "src/book/book.model";
import { BookCover } from "src/book/book-cover.component";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import { shortDateLabel } from "src/loan/loan.model";
import type { LoanRecord } from "src/loan/loan-log.model";
import styles from "./loan-log.module.css";

type LoanLogProps = {
  child: Child;
  records: LoanRecord[];
  onEdit: () => void;
};

const pencil = (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
  >
    <path d="M13.5 3.5l3 3L6 17H3v-3z" />
    <path d="M11.5 5.5l3 3" />
  </svg>
);

function summaryLabel(records: LoanRecord[]) {
  const returned = records.filter((r) => r.status === "returned").length;
  const reading = records.some((r) => r.status === "reading");
  if (records.length === 0) {
    return "Aún no se ha llevado ningún libro";
  }
  if (returned === 0 && reading) {
    return "Su primer libro, en casa";
  }
  const devueltos =
    returned === 1 ? "1 libro devuelto" : `${returned} libros devueltos`;
  if (reading) {
    return `${devueltos}, uno en casa`;
  }
  return devueltos;
}

function titleOf(book: Book | undefined) {
  if (!book) {
    return "Un libro que ya no está en la biblioteca";
  }
  return book.title;
}

function datesLabel(record: LoanRecord) {
  if (record.status === "returned" && record.returnedOn) {
    return `del ${shortDateLabel(record.since)} al ${shortDateLabel(record.returnedOn)}`;
  }
  if (record.status === "reading") {
    return `en casa desde el ${shortDateLabel(record.since)}`;
  }
  return `se lo llevó el ${shortDateLabel(record.since)} y no volvió`;
}

function rowClass(record: LoanRecord) {
  if (record.status === "reading") {
    return `${styles.row} ${styles.reading}`;
  }
  if (record.status === "unreturned") {
    return `${styles.row} ${styles.unreturned}`;
  }
  return styles.row;
}

export function LoanLog({ child, records, onEdit }: LoanLogProps) {
  const titleId = useId();

  // Stable identity, or React re-attaches the ref and re-scrolls every render.
  const scrollIn = useCallback((node: HTMLElement | null) => {
    node?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <section ref={scrollIn} className={styles.card} aria-labelledby={titleId}>
      <header className={styles.masthead}>
        <ChildAvatar emoji={child.emoji} color={child.color} size="medium" />
        <div className={styles.who}>
          <h2 id={titleId} className={styles.tag}>
            {child.tag}
          </h2>
          <p className={styles.summary}>{summaryLabel(records)}</p>
        </div>
        <button
          type="button"
          className={styles.edit}
          aria-label={`Editar a ${child.tag}`}
          onClick={onEdit}
        >
          {pencil}
        </button>
      </header>

      {records.length > 0 && (
        <ol className={styles.list}>
          {records.map((record) => (
            <li
              key={`${record.book?.id ?? "gone"}:${record.since}`}
              className={rowClass(record)}
            >
              <BookCover
                title={record.book?.title ?? "?"}
                coverUrl={record.book?.coverUrl}
                size="small"
              />
              <span className={styles.entry}>
                <span className={styles.bookTitle}>{titleOf(record.book)}</span>
                <span className={styles.dates}>{datesLabel(record)}</span>
              </span>
              {record.status === "returned" && (
                <span className={styles.stamp} aria-hidden="true">
                  ✓
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
