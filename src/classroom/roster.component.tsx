import { useId } from "react";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import styles from "./roster.module.css";

type RosterProps = {
  childList: Child[];
  editingId: string | null;
  onSelect: (childId: string) => void;
};

export function Roster({ childList, editingId, onSelect }: RosterProps) {
  const titleId = useId();

  return (
    <section className={styles.roster} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        La lista de clase
      </h2>
      {childList.length === 0 && (
        <p className={styles.empty}>Aquí irán apareciendo tus peques</p>
      )}

      {childList.length > 0 && (
        <ul className={styles.list}>
          {childList.map((child) => (
            <li key={child.id}>
              <button
                type="button"
                className={styles.chip}
                aria-pressed={child.id === editingId}
                aria-label={`${child.tag}, editar`}
                onClick={() => onSelect(child.id)}
              >
                <ChildAvatar
                  emoji={child.emoji}
                  color={child.color}
                  size="small"
                />
                <span className={styles.tag}>{child.tag}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
