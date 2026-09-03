import type { ReactNode } from "react";
import styles from "./project-heading.module.css";

type ProjectHeadingProps = {
  name: string;
  // "La clase · 12 peques", "El reparto · 3 de 12 con libro". Its own element,
  // so a screen can make it a live region when the numbers move under a tap.
  // Optional: the dashboard puts a counter and the privacy trigger up here
  // instead and has never carried one.
  dateline?: ReactNode;
  // A back button, before the name. The screen keeps ownership of it: the
  // assign flow's "Volver a la semana" is its own control, not the heading's.
  before?: ReactNode;
  // Counters and the privacy trigger, after the name.
  after?: ReactNode;
};

// Every screen's masthead. It carries the h1 — until this existed each screen
// titled itself with a <p> while its sections used <h2>, so every document
// outline in the app started at level 2 with nothing above it.
export function ProjectHeading({
  name,
  dateline,
  before,
  after,
}: ProjectHeadingProps) {
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
