import { type ReactNode, useEffect, useRef } from "react";
import styles from "./confirm-remove.module.css";

type ConfirmRemoveProps = {
  label: string; // accessible name, e.g. "Quitar a Rana"
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode; // the consequence, in the teacher's words
};

// Removing something that is out in the world — a child holding a book, a book
// at a child's home — is never silent. The panel mounts on demand, so the
// alertdialog contract is a mount effect: focus moves in, which also scrolls
// it into view since the trigger sits far below it.
export function ConfirmRemove({
  label,
  onConfirm,
  onCancel,
  children,
}: ConfirmRemoveProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className={styles.panel}
      role="alertdialog"
      aria-label={label}
    >
      <p className={styles.text}>{children}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.confirm} onClick={onConfirm}>
          Sí, quitarlo
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          No, mantenerlo
        </button>
      </div>
    </div>
  );
}
