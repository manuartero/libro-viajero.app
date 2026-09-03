import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./privacy-note.module.css";

// aria-modal alone does not stop Tab from walking into the dashboard behind
// the panel; wrap it between the panel's first and last control instead.
const keepFocusInside = ({
  event,
  panel,
}: {
  event: KeyboardEvent;
  panel: HTMLElement | null;
}) => {
  if (!panel) {
    return;
  }
  const controls = panel.querySelectorAll<HTMLElement>("button");
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (!first || !last) {
    return;
  }
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !panel.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
    event.preventDefault();
    first.focus();
  }
};

type PrivacyNoteProps = {
  onDownloadData: () => void;
};

export function PrivacyNote({ onDownloadData }: PrivacyNoteProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // The trigger is always mounted, so focus can go straight back to it.
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    titleRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key === "Tab") {
        keepFocusInside({ event, panel: panelRef.current });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
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
            ref={panelRef}
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
            <button type="button" className={styles.close} onClick={close}>
              Cerrar
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
