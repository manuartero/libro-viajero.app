import { useEffect, useId, useRef, useState } from "react";
import { bookTitleOf } from "src/book/book.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import type { MissingBook } from "src/project/project.model";
import styles from "./missing-summary.module.css";

type MissingSummaryProps = {
  missing: MissingBook[];
};

const reminderMessage = ({ tag, title }: { tag: string; title: string }) =>
  `¡Hola! Un recordatorio: el libro «${title}» de ${tag} aún no ha vuelto a clase. Sin agobios — ¡cuando podáis! 📚`;

// What the copy button last did, for the one row it happened on.
type CopyOutcome = { childId: string; copied: boolean } | null;

type CopyState = "idle" | "copied" | "failed";

function outcomeFor({
  outcome,
  childId,
}: {
  outcome: CopyOutcome;
  childId: string;
}): CopyState {
  if (outcome === null || outcome.childId !== childId) {
    return "idle";
  }
  if (outcome.copied) {
    return "copied";
  }
  return "failed";
}

function copyText(state: CopyState) {
  if (state === "copied") {
    return "Copiado ✓";
  }
  if (state === "failed") {
    return "No se pudo copiar";
  }
  return "Copiar aviso";
}

// Every row has a copy button, so the name has to say whose. It also carries
// the outcome: the teacher's focus is on the button when it changes, which is
// what announces it — the dashboard's one role="status" belongs to the counter.
function copyLabel({ state, tag }: { state: CopyState; tag: string }) {
  if (state === "copied") {
    return `Copiado, aviso de ${tag}`;
  }
  if (state === "failed") {
    return `No se pudo copiar el aviso de ${tag}`;
  }
  return `Copiar aviso de ${tag}`;
}

export function MissingSummary({ missing }: MissingSummaryProps) {
  const titleId = useId();

  const [outcome, setOutcome] = useState<CopyOutcome>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) {
        clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  const flash = (next: NonNullable<CopyOutcome>) => {
    setOutcome(next);
    if (resetTimer.current !== null) {
      clearTimeout(resetTimer.current);
    }
    resetTimer.current = setTimeout(() => setOutcome(null), 2000);
  };

  const copyReminder = async ({ child, book }: MissingBook) => {
    try {
      // Rejects when the clipboard permission is denied, and
      // navigator.clipboard is undefined outside a secure context.
      await navigator.clipboard.writeText(
        reminderMessage({ tag: child.tag, title: book?.title ?? "su libro" }),
      );
      flash({ childId: child.id, copied: true });
    } catch (error) {
      // Say so on the button; keep the real cause reachable in the console.
      console.error("libro-viajero: copying the reminder failed", error);
      flash({ childId: child.id, copied: false });
    }
  };

  if (missing.length === 0) {
    return (
      <section className={styles.summary}>
        <p className={styles.allBack}>¡Todos los libros han vuelto! 🎉</p>
      </section>
    );
  }

  return (
    <section className={styles.summary} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Faltan {missing.length}
      </h2>
      <ul className={styles.list}>
        {missing.map(({ child, book }) => {
          const state = outcomeFor({ outcome, childId: child.id });
          return (
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
                aria-label={copyLabel({ state, tag: child.tag })}
                onClick={() => copyReminder({ child, book })}
              >
                {copyText(state)}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
