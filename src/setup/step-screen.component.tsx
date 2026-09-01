import type { ReactNode } from "react";
import styles from "./step-screen.module.css";

type StepScreenProps = {
  classroomName: string;
  dateline: string;
  backLabel: string;
  onBack: () => void;
  footer: ReactNode;
  children: ReactNode;
};

export function StepScreen({
  classroomName,
  dateline,
  backLabel,
  onBack,
  footer,
  children,
}: StepScreenProps) {
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
