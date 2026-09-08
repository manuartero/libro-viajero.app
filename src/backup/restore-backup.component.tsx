import { type ChangeEvent, useEffect, useId, useRef, useState } from "react";
import type { AppData } from "src/app-data/app-data.model";
import {
  type Backup,
  backupDateline,
  backupSummary,
  readBackup,
} from "src/backup/backup.model";
import styles from "./restore-backup.module.css";

type RestoreBackupProps = {
  prompt?: string;
  replacing?: string;
  // Whether the save persisted; on false the preview stays for a retry.
  onRestore: (appData: AppData) => boolean;
};

export function RestoreBackup({
  prompt,
  replacing,
  onRestore,
}: RestoreBackupProps) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const [backup, setBackup] = useState<Backup | null>(null);
  const [unreadable, setUnreadable] = useState(false);

  // The preview replaces the link that opened it, so focus has to be walked
  // over and back by hand.
  useEffect(() => {
    if (backup) {
      previewRef.current?.focus();
      return () => triggerRef.current?.focus();
    }
  }, [backup]);

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const readPickedFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Cleared so picking the same file again fires a change.
    event.target.value = "";
    if (!file) {
      return;
    }
    const read = await readBackup(file);
    setUnreadable(read === null);
    setBackup(read);
  };

  const restore = () => {
    if (backup && onRestore(backup.appData)) {
      setBackup(null);
    }
  };

  return (
    <div className={styles.restore}>
      {!backup && (
        <>
          {prompt && <p className={styles.prompt}>{prompt}</p>}
          <button
            ref={triggerRef}
            type="button"
            className={styles.trigger}
            onClick={openPicker}
          >
            Recuperar una copia
          </button>
          {unreadable && (
            <p role="alert" className={styles.error}>
              Este archivo no es una copia de Libro viajero. Busca uno llamado
              libro-viajero-fecha.json.
            </p>
          )}
        </>
      )}

      {backup && (
        <section
          ref={previewRef}
          tabIndex={-1}
          className={styles.preview}
          aria-labelledby={titleId}
        >
          <div className={styles.clipping}>
            <h2 id={titleId} className={styles.name}>
              {backup.project.name}
            </h2>
            <p className={styles.dateline}>{backupDateline(backup)}</p>
            <p className={styles.summary}>{backupSummary(backup.project)}</p>
          </div>
          {replacing && (
            <p className={styles.warning}>
              Sustituirá a «{replacing}» en este teléfono.
            </p>
          )}
          <button type="button" className={styles.confirm} onClick={restore}>
            Sí, recuperar esta clase
          </button>
          <button
            type="button"
            className={styles.cancel}
            onClick={() => setBackup(null)}
          >
            No, dejarlo como está
          </button>
        </section>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        aria-label="Archivo de la copia"
        hidden
        onChange={readPickedFile}
      />
    </div>
  );
}
