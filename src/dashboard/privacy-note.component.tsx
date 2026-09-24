import { useId, useRef } from "react";
import type { AppData } from "src/app-data/app-data.model";
import { DownloadIcon } from "src/backup/backup-icon.component";
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
        aria-label="Tus datos"
        onClick={open}
      >
        <DownloadIcon />
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
        <p className={styles.lead}>Tu clase vive solo en este teléfono.</p>
        <p className={styles.body}>
          Sin cuentas ni servidor. Solo el título que buscas sale a Open
          Library, para traer la portada.
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
          <DownloadIcon size={20} />
          Descargar una copia
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
