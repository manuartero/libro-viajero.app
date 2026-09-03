import type { ReactNode } from "react";
import styles from "./screen.module.css";

type ScreenProps = {
  masthead: string;
  dateline: string;
  lead?: ReactNode; // a control pinned left of the masthead, e.g. a back arrow
  children: ReactNode;
  // Sibling of <main>, not part of it: the screen's own sticky action bar,
  // which must stay full-bleed rather than inherit the body's padding.
  footer?: ReactNode;
};

// The chrome every full screen shares: a sticky masthead over a scrolling
// body, centred at the mobile column width. The dashboard keeps its own
// header — it pairs the project name with tools instead of a dateline.
export function Screen({
  masthead,
  dateline,
  lead,
  children,
  footer,
}: ScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        {lead}
        <div className={styles.mastheadBlock}>
          <p className={styles.masthead}>{masthead}</p>
          <p className={styles.dateline}>{dateline}</p>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      {footer}
    </div>
  );
}
