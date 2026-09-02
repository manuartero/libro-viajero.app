import { useEffect, useId, useRef, useState } from "react";
import styles from "./privacy-note.module.css";

type PrivacyNoteProps = {
  onDownloadData: () => void;
};

export function PrivacyNote({ onDownloadData }: PrivacyNoteProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    titleRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Tus datos y privacidad"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        ?
      </button>

      {open ? (
        <div className={styles.backdrop}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={styles.panel}
          >
            <h2
              id={titleId}
              ref={titleRef}
              tabIndex={-1}
              className={styles.title}
            >
              Tus datos
            </h2>
            <p className={styles.lead}>
              Ningún dato sale de tu teléfono sin que tú lo sepas.
            </p>
            <p className={styles.body}>
              No hay servidor ni cuentas. La clase se guarda en este navegador,
              en este teléfono. Nadie más puede verla.
            </p>
            <p className={styles.body}>
              Lo único que viaja: al buscar un libro, el título que escribes se
              envía a Open Library para encontrar la portada. Nada más.
            </p>
            <p className={styles.body}>
              Si borras los datos del navegador, se borra la clase. Descarga una
              copia de vez en cuando.
            </p>
            <button
              type="button"
              className={styles.download}
              onClick={onDownloadData}
            >
              Descargar mis datos
            </button>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
            >
              Cerrar
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
