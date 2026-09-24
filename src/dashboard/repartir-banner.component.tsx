import styles from "./repartir-banner.module.css";

type RepartirBannerProps = {
  text: string;
  onRepartir: () => void;
};

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
