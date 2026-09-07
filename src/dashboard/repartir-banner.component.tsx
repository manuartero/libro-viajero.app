import { pluralLibros } from "src/book/book.model";
import { pluralPeques } from "src/child/child.model";
import styles from "./repartir-banner.module.css";

type RepartirBannerProps = {
  text: string;
  onRepartir: () => void;
};

export function booklessText(unassignedCount: number) {
  return `${pluralPeques(unassignedCount)} sin libro`;
}

export function returnedText(returnedCount: number) {
  if (returnedCount === 1) {
    return "1 libro devuelto";
  }
  return `${pluralLibros(returnedCount)} devueltos`;
}

export function RepartirBanner({ text, onRepartir }: RepartirBannerProps) {
  return (
    <div className={styles.repartirBanner}>
      <p className={styles.repartirText}>{text}</p>
      <button type="button" className={styles.repartirCta} onClick={onRepartir}>
        Repartir libros
      </button>
    </div>
  );
}
