import { useId, useRef } from "react";
import styles from "./privacy-note.module.css";

type PrivacyNoteProps = {
  onDownloadData: () => void;
};

// A real modal dialog, so the platform owns the parts that were hand-rolled
// here: the focus trap (top-layer inertness blocks Tab, clicks and assistive
// tech alike, not just the buttons a querySelectorAll happened to find),
// Escape, and putting focus back on the trigger when it closes. What is left
// is one ref and two calls.
export function PrivacyNote({ onDownloadData }: PrivacyNoteProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    // The panel is four paragraphs of prose, so focus goes to the dialog
    // itself and it is read out whole. Left to the platform, focus would
    // land on the first button — which is the download.
    dialog?.focus();
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Tus datos y privacidad"
        onClick={open}
      >
        ?
      </button>

      <dialog
        ref={dialogRef}
        tabIndex={-1}
        className={styles.panel}
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={styles.title}>
          Tus datos
        </h2>
        <p className={styles.lead}>
          Ningún dato sale de tu teléfono sin que tú lo sepas.
        </p>
        <p className={styles.body}>
          No hay servidor ni cuentas. La clase se guarda en este navegador, en
          este teléfono. Nadie más puede verla.
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
          onClick={() => dialogRef.current?.close()}
        >
          Cerrar
        </button>
      </dialog>
    </>
  );
}
