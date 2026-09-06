import { useId } from "react";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import styles from "./roster.module.css";

type RosterProps = {
  childList: Child[];
  // The child whose card is open below the list, if any.
  selectedId: string | null;
  onSelect: (childId: string) => void;
};

export function Roster({ childList, selectedId, onSelect }: RosterProps) {
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
                aria-pressed={child.id === selectedId}
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
