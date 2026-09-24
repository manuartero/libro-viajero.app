import { useId, useRef } from "react";
import { ColophonIcon } from "src/colophon/colophon-icon.component";
import { license, version } from "../../package.json";
import styles from "./colophon.module.css";

const REPO_URL = "https://github.com/manuartero/libro-viajero.app";

export function Colophon() {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    // Focus the prose, not the first link (which leaves for GitHub).
    dialog?.focus();
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={`Acerca de libro-viajero v${version}`}
        aria-haspopup="dialog"
        onClick={open}
      >
        v{version}
      </button>

      <dialog
        ref={dialogRef}
        tabIndex={-1}
        className={styles.panel}
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={styles.version}>
          v{version}
        </h2>
        <p className={styles.body}>
          Una ayuda para la profe con el libro viajero: marca en un momento
          quién ha devuelto su libro y deja listo el reparto de la semana que
          viene.
        </p>
        <ul className={styles.links}>
          <li>
            <a
              className={styles.link}
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ColophonIcon name="github" />
              Código abierto
            </a>
          </li>
          <li>
            <a
              className={styles.link}
              href={`${REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ColophonIcon name="law" />
              Licencia {license}
            </a>
          </li>
          <li>
            <a
              className={styles.link}
              href={`${REPO_URL}/issues/new`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ColophonIcon name="bug" />
              Avisar de un fallo
            </a>
          </li>
        </ul>
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
