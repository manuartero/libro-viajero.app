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

// The reparto's call to action with a reason next to it: somebody is still
// without a book, or books came back and are waiting on the tray. The
// dashboard's plain "Repartir libros" button covers the case with neither,
// and exactly one of the two is ever on screen — two at once would make the
// name ambiguous.
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
