import { useState } from "react";
import styles from "./tag-field.module.css";

type TagFieldProps = {
  tag: string;
  hasEmoji: boolean;
  onChange: (tag: string) => void;
};

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
            aria-describedby="child-tag-hint"
            onChange={(event) => onChange(event.target.value)}
          />
          <p id="child-tag-hint" className={styles.hint}>
            Nada de nombres reales: solo tú sabes quién es.
          </p>
        </>
      )}

      {!changing && (
        <>
          <dl className={styles.tagPair}>
            <dt className={styles.tagLabel}>Apodo</dt>

            {hasEmoji && (
              <dd id="child-tag-value" className={styles.tagValue}>
                {tag}
              </dd>
            )}

            {!hasEmoji && <dd className={styles.tagEmpty}>Toca un emoji</dd>}
          </dl>

          {hasEmoji && (
            <button
              type="button"
              className={styles.changeTag}
              aria-describedby="child-tag-value"
              onClick={() => setChanging(true)}
            >
              Cambiar apodo
            </button>
          )}
        </>
      )}
    </div>
  );
}
