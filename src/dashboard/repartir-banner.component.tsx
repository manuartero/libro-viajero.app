import { pluralPeques } from "src/child/child.model";
import styles from "./repartir-banner.module.css";

type RepartirBannerProps = {
  unassignedCount: number;
  onRepartir: () => void;
};

// Shown only while somebody is still without a book. The dashboard's other
// "Repartir libros" button covers the opposite case, and exactly one of the
// two is ever on screen — two at once would make the name ambiguous.
export function RepartirBanner({
  unassignedCount,
  onRepartir,
}: RepartirBannerProps) {
  return (
    <div className={styles.repartirBanner}>
      <p className={styles.repartirText}>
        {pluralPeques(unassignedCount)} sin libro
      </p>
      <button type="button" className={styles.repartirCta} onClick={onRepartir}>
        Repartir libros
      </button>
    </div>
  );
}
