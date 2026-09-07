import { type KeyboardEvent, type ReactNode, useCallback, useId } from "react";
import styles from "./confirm-panel.module.css";

type ConfirmPanelProps = {
  label: string;
  children: ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Needs React 19: the focus return rides on ref-callback cleanup.
export function ConfirmPanel({
  label,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmPanelProps) {
  const textId = useId();

  // Stable identity matters: React re-attaches a ref whose callback changed,
  // so an inline arrow would yank focus back here on every host render.
  const holdFocus = useCallback((node: HTMLDivElement | null) => {
    const trigger = document.activeElement;
    node?.focus();
    return () => {
      if (trigger instanceof HTMLElement) {
        trigger.focus();
      }
    };
  }, []);

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
