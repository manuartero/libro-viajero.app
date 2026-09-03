import { type ReactNode, useId } from "react";
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

// The whole alertdialog contract in one place: focus moves into the panel when
// it opens — which also scrolls it into view, since the trigger sits far below
// it — Escape cancels, and focus returns to the trigger on close.
//
// The ref callback covers all of it: it runs on mount and its cleanup on
// unmount, so opening is handled where it happens instead of in an effect
// watching a state value, and there is no dependency to keep in sync.
export function ConfirmPanel({
  label,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmPanelProps) {
  const textId = useId();

  return (
    <div
      ref={(node) => {
        const trigger = document.activeElement;
        node?.focus();
        return () => {
          if (trigger instanceof HTMLElement) {
            trigger.focus();
          }
        };
      }}
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
