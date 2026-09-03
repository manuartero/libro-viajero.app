import { type ReactNode, useCallback, useId } from "react";
import styles from "./confirm-panel.module.css";

type ConfirmPanelProps = {
  // Names the panel for assistive tech, e.g. "Quitar a Rana".
  label: string;
  // The consequence, in the caller's own words — it is what the panel is for.
  children: ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Focus moves into the panel on open — which also scrolls it into view, since
// the trigger sits far below it — Escape cancels, and focus returns to the
// trigger on close. Needs React 19: it rides on ref-callback cleanup.
export function ConfirmPanel({
  label,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmPanelProps) {
  const textId = useId();

  // Stable identity is load-bearing, not a micro-optimisation: React detaches
  // and re-attaches a ref whose callback changed, so an inline arrow would run
  // this on every render of the host screen and yank focus off whichever
  // button the teacher had reached.
  const holdFocus = useCallback((node: HTMLDivElement | null) => {
    const trigger = document.activeElement;
    node?.focus();
    return () => {
      if (trigger instanceof HTMLElement) {
        trigger.focus();
      }
    };
  }, []);

  return (
    <div
      ref={holdFocus}
      tabIndex={-1}
      className={styles.confirmPanel}
      role="alertdialog"
      aria-label={label}
      aria-describedby={textId}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onCancel();
        }
      }}
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
