import { useEffect, useRef } from "react";
import type { Child } from "src/child/child.model";
import styles from "./remove-child-confirm.module.css";

type RemoveChildConfirmProps = {
  child: Child;
  onConfirm: () => void;
  onCancel: () => void;
};

export function RemoveChildConfirm({
  child,
  onConfirm,
  onCancel,
}: RemoveChildConfirmProps) {
  // The alertdialog contract: focus moves into the panel when it opens —
  // which also scrolls it into view, since the trigger sits far below it.
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className={styles.confirmPanel}
      role="alertdialog"
      aria-label={`Quitar a ${child.tag}`}
    >
      <p className={styles.confirmText}>
        «{child.tag}» tiene un libro en casa. Si lo quitas, el libro vuelve a la
        biblioteca.
      </p>
      <div className={styles.confirmActions}>
        <button
          type="button"
          className={styles.confirmRemove}
          onClick={onConfirm}
        >
          Sí, quitarlo
        </button>
        <button
          type="button"
          className={styles.confirmCancel}
          onClick={onCancel}
        >
          No, mantenerlo
        </button>
      </div>
    </div>
  );
}
