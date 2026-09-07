import type { ReactNode } from "react";
import styles from "./masthead.module.css";

type MastheadProps = {
  name: string;
  dateline?: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
};

export function Masthead({ name, dateline, before, after }: MastheadProps) {
  return (
    <header className={styles.header}>
      {before}
      <div className={styles.mastheadBlock}>
        <h1 className={styles.masthead}>{name}</h1>
        {dateline && <p className={styles.dateline}>{dateline}</p>}
      </div>
      {after}
    </header>
  );
}
