import { type KeyboardEvent, type ReactNode, useId } from "react";
import styles from "./confirm-panel.module.css";

type ConfirmPanelProps = {
  label: string;
  children: ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Needs React 19: the focus return rides on ref-callback cleanup. Module scope
// keeps it stable, or React would re-run it and yank focus back on every render.
const holdFocus = (node: HTMLDivElement | null) => {
  const trigger = document.activeElement;
  node?.focus();
  return () => {
    if (trigger instanceof HTMLElement) {
      trigger.focus();
    }
  };
};

export function ConfirmPanel({
  label,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmPanelProps) {
  const textId = useId();

  const cancelOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      ref={holdFocus}
      tabIndex={-1}
      className={styles.confirmPanel}
      role="alertdialog"
      aria-label={label}
      aria-describedby={textId}
      onKeyDown={cancelOnEscape}
    >
      <p id={textId} className={styles.confirmText}>
        {children}
      </p>
      <div className={styles.confirmActions}>
        <button
          type="button"
          className={styles.confirmRemove}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
        <button
          type="button"
          className={styles.confirmCancel}
          onClick={onCancel}
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
}
