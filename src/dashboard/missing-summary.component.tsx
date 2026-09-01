import { useState } from "react";
import { ChildAvatar } from "src/child/child-avatar.component";
import type { ChildWithBook } from "src/project/project.model";
import styles from "./missing-summary.module.css";

type MissingSummaryProps = {
  missing: ChildWithBook[];
};

const reminderMessage = ({ tag, title }: { tag: string; title: string }) =>
  `Hi! Just a reminder that ${tag}'s copy of '${title}' hasn't come back yet. No worries — just whenever you can! 📚`;

export function MissingSummary({ missing }: MissingSummaryProps) {
  const [copiedChildId, setCopiedChildId] = useState<string | null>(null);

  if (missing.length === 0) {
    return (
      <section className={styles.summary}>
        <p className={styles.allBack}>¡Todos los libros han vuelto! 🎉</p>
      </section>
    );
  }

  const copyReminder = async ({ child, book }: ChildWithBook) => {
    await navigator.clipboard.writeText(
      reminderMessage({ tag: child.tag, title: book?.title ?? "su libro" }),
    );
    setCopiedChildId(child.id);
    setTimeout(
      () => setCopiedChildId((prev) => (prev === child.id ? null : prev)),
      2000,
    );
  };

  return (
    <section className={styles.summary} aria-labelledby="missing-title">
      <h2 id="missing-title" className={styles.title}>
        Faltan {missing.length}
      </h2>
      <ul className={styles.list}>
        {missing.map(({ child, book }) => (
          <li key={child.id} className={styles.row}>
            <span className={styles.who}>
              <ChildAvatar emoji={child.emoji} color={child.color} size="xsmall" />
              {child.tag}
              <span className={styles.bookTitle}>
                {book ? book.title : "sin libro"}
              </span>
            </span>
            <button
              type="button"
              className={styles.copy}
              onClick={() => copyReminder({ child, book })}
            >
              {copiedChildId === child.id ? "Copiado ✓" : "Copiar aviso"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
