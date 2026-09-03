import styles from "./return-counter.module.css";

type ReturnCounterProps = {
  returned: number;
  total: number;
};

function countClass(allBack: boolean) {
  if (allBack) {
    return styles.done;
  }
  return styles.count;
}

export function ReturnCounter({ returned, total }: ReturnCounterProps) {
  const allBack = returned === total;
  return (
    <p
      className={styles.counter}
      role="status"
      aria-label={`${returned} de ${total} libros devueltos`}
    >
      <span className={countClass(allBack)}>{returned}</span>
      <span className={styles.total}>/{total}</span>
      {allBack && <span aria-hidden="true"> 🎉</span>}
    </p>
  );
}
