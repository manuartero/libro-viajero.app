import { useState } from "react";
import styles from "./tag-field.module.css";

type TagFieldProps = {
  tag: string;
  hasEmoji: boolean;
  onChange: (tag: string) => void;
};

// The nickname defaults to the emoji's name. Typing one is a deliberate,
// secondary action: the happy path never asks for a name at all.
export function TagField({ tag, hasEmoji, onChange }: TagFieldProps) {
  const [changing, setChanging] = useState(false);

  return (
    <div className={styles.tagField}>
      {changing && (
        <>
          <label className={styles.tagLabel} htmlFor="child-tag">
            Apodo
          </label>
          <input
            id="child-tag"
            // biome-ignore lint/a11y/noAutofocus: the field only mounts after a deliberate "Cambiar apodo" tap
            autoFocus
            className={styles.tagInput}
            type="text"
            value={tag}
            maxLength={20}
            autoComplete="off"
            onChange={(event) => onChange(event.target.value)}
          />
          <p className={styles.hint}>
            Nada de nombres reales: solo tú sabes quién es.
          </p>
        </>
      )}

      {!changing && (
        <>
          <p className={styles.tagLabel}>Apodo</p>

          {hasEmoji && (
            <>
              <p className={styles.tagValue}>{tag}</p>
              <button
                type="button"
                className={styles.changeTag}
                onClick={() => setChanging(true)}
              >
                Cambiar apodo
              </button>
            </>
          )}

          {!hasEmoji && <p className={styles.tagEmpty}>Toca un emoji</p>}
        </>
      )}
    </div>
  );
}
