import { useState } from "react";
import { type Book, bookTitleOf } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import styles from "./missing-summary.module.css";

type MissingSummaryProps = {
  missing: { child: Child; book: Book | undefined }[];
};

const reminderMessage = ({ tag, title }: { tag: string; title: string }) =>
  `¡Hola! Un recordatorio: el libro «${title}» de ${tag} aún no ha vuelto a clase. Sin agobios — ¡cuando podáis! 📚`;

function copyLabel(copied: boolean) {
  if (copied) {
    return "Copiado ✓";
  }
  return "Copiar aviso";
}

export function MissingSummary({ missing }: MissingSummaryProps) {
  const [copiedChildId, setCopiedChildId] = useState<string | null>(null);

  if (missing.length === 0) {
    return (
      <section className={styles.summary}>
        <p className={styles.allBack}>¡Todos los libros han vuelto! 🎉</p>
      </section>
    );
  }

  const copyReminder = async ({
    child,
    book,
  }: MissingSummaryProps["missing"][number]) => {
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
              <ChildAvatar
                emoji={child.emoji}
                color={child.color}
                size="tiny"
              />
              {child.tag}
              <span className={styles.bookTitle}>{bookTitleOf(book)}</span>
            </span>
            <button
              type="button"
              className={styles.copy}
              onClick={() => copyReminder({ child, book })}
            >
              {copyLabel(copiedChildId === child.id)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
