import type { ReactNode } from "react";
import styles from "./step-shell.module.css";

type StepShellProps = {
  classroomName: string;
  dateline: string;
  backLabel: string;
  onBack: () => void;
  footer: ReactNode;
  children: ReactNode;
};

// Shared chrome for wizard steps 2-4: sticky masthead header with back
// button, scrolling main, sticky footer for the step's CTA.
export function StepShell({
  classroomName,
  dateline,
  backLabel,
  onBack,
  footer,
  children,
}: StepShellProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          aria-label={backLabel}
          onClick={onBack}
        >
          ←
        </button>
        <div className={styles.mastheadBlock}>
          <p className={styles.masthead}>{classroomName}</p>
          <p className={styles.dateline}>{dateline}</p>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>{footer}</footer>
    </div>
  );
}
