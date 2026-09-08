import { useId, useRef } from "react";
import type { AppData } from "src/app-data/app-data.model";
import { RestoreBackup } from "src/backup/restore-backup.component";
import styles from "./privacy-note.module.css";

type PrivacyNoteProps = {
  projectName: string;
  onDownloadData: () => void;
  onRestoreData: (appData: AppData) => boolean;
};

export function PrivacyNote({
  projectName,
  onDownloadData,
  onRestoreData,
}: PrivacyNoteProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    // Focus the prose, not the first button (which is the download).
    dialog?.focus();
  };

  const restoreAndClose = (appData: AppData) => {
    const restored = onRestoreData(appData);
    if (restored) {
      dialogRef.current?.close();
    }
    return restored;
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
        <RestoreBackup replacing={projectName} onRestore={restoreAndClose} />
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
