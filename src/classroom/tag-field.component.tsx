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
            aria-describedby="child-tag-hint"
            onChange={(event) => onChange(event.target.value)}
          />
          {/* Described by the input, not just placed near it: the privacy rule
              is the whole point of the field. */}
          <p id="child-tag-hint" className={styles.hint}>
            Nada de nombres reales: solo tú sabes quién es.
          </p>
        </>
      )}

      {!changing && (
        <>
          {/* A term and its value, so "Apodo" labels something here too — in
              edit mode it is a real <label>, and it should not degrade to a
              floating paragraph just because the input is gone. */}
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
