import { useId, useRef } from "react";
import type { AppData } from "src/app-data/app-data.model";
import { RestoreBackup } from "src/backup/restore-backup.component";
import styles from "./privacy-note.module.css";

const downloadIcon = (
  <svg
    aria-hidden="true"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="square"
  >
    <path d="M11 3v10" />
    <path d="M6.5 9l4.5 4.5L15.5 9" />
    <path d="M3.5 15v3.5h15V15" />
  </svg>
);

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
        {downloadIcon}
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
