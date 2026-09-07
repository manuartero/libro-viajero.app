import type { Tab } from "src/navigation/navigation.model";
import type { Project } from "src/project/project.model";
import styles from "./empty-card.module.css";

export function emptyStateFor({
  project,
  onNavigate,
  onRepartir,
}: {
  project: Project;
  onNavigate: (tab: Tab) => void;
  onRepartir: () => void;
}) {
  if (project.children.length === 0) {
    return {
      text: "Todavía no hay peques en la clase.",
      cta: "Añadir peques",
      onCta: () => onNavigate("clase"),
    };
  }
  if (project.books.length === 0) {
    return {
      text: "La biblioteca está vacía.",
      cta: "Añadir libros",
      onCta: () => onNavigate("biblioteca"),
    };
  }
  if (project.currentAssignments.length === 0) {
    return {
      text: "Los libros esperan lector.",
      cta: "Repartir libros",
      onCta: onRepartir,
    };
  }
  return null;
}

type EmptyCardProps = {
  text: string;
  cta: string;
  onCta: () => void;
};

export function EmptyCard({ text, cta, onCta }: EmptyCardProps) {
  return (
    <div className={styles.emptyCard}>
      <p className={styles.emptyText}>{text}</p>
      <button type="button" className={styles.emptyCta} onClick={onCta}>
        {cta}
      </button>
    </div>
  );
}
