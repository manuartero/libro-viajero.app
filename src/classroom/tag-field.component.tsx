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
      {changing && <TagInput tag={tag} onChange={onChange} />}

      {!changing && (
        <TagValue
          tag={tag}
          hasEmoji={hasEmoji}
          onStartChange={() => setChanging(true)}
        />
      )}
    </div>
  );
}

function TagInput({
  tag,
  onChange,
}: {
  tag: string;
  onChange: (tag: string) => void;
}) {
  return (
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
  );
}

function TagValue({
  tag,
  hasEmoji,
  onStartChange,
}: {
  tag: string;
  hasEmoji: boolean;
  onStartChange: () => void;
}) {
  return (
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
          onClick={onStartChange}
        >
          Cambiar apodo
        </button>
      )}
    </>
  );
}
