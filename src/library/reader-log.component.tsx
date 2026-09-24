import type { Book } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import { loanDatesLabel, type ReaderRecord } from "src/loan/loan-log.model";
import styles from "./reader-log.module.css";

type ReaderLogProps = {
  book: Book;
  records: ReaderRecord[];
};

const goneChild = { emoji: "?", color: "var(--paper-dark)" };

// Module scope keeps the ref callback stable: React re-runs one that changed,
// so an inline arrow would re-scroll on every render.
const scrollIn = (node: HTMLElement | null) => {
  node?.scrollIntoView({ block: "nearest" });
};

function viajes(count: number) {
  if (count === 1) {
    return "1 viaje";
  }
  return `${count} viajes`;
}

function summaryLabel(records: ReaderRecord[]) {
  const reader = records.find((r) => r.status === "reading")?.child;
  if (records.length === 0) {
    return "Aún no ha salido de la clase";
  }
  if (reader && records.length === 1) {
    return `Su primer viaje: en casa de «${reader.tag}»`;
  }
  if (reader) {
    return `${viajes(records.length)}, ahora en casa de «${reader.tag}»`;
  }
  return viajes(records.length);
}

function tagOf(child: Child | undefined) {
  if (!child) {
    return "Un peque que ya no está en la clase";
  }
  return child.tag;
}

function rowClass(record: ReaderRecord) {
  if (record.status === "reading") {
    return `${styles.row} ${styles.reading}`;
  }
  if (record.status === "unreturned") {
    return `${styles.row} ${styles.unreturned}`;
  }
  return styles.row;
}

export function ReaderLog({ book, records }: ReaderLogProps) {
  return (
    <section
      ref={scrollIn}
      className={styles.log}
      aria-label={`Viajes de ${book.title}`}
    >
      <p className={styles.summary}>{summaryLabel(records)}</p>

      {records.length > 0 && (
        <ol className={styles.list}>
          {records.map((record) => (
            <li
              key={`${record.child?.id ?? "gone"}:${record.since}`}
              className={rowClass(record)}
            >
              <ChildAvatar child={record.child ?? goneChild} size="tiny" />
              <span className={styles.entry}>
                <span className={styles.tag}>{tagOf(record.child)}</span>
                <span className={styles.dates}>{loanDatesLabel(record)}</span>
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
