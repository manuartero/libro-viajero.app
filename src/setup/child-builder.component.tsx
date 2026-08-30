import { useState } from "react";
import {
  AVATAR_COLORS,
  CURATED_EMOJIS,
  type CuratedEmoji,
  nextUnusedColor,
} from "src/child/avatar-catalog";
import type { Child } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import styles from "./child-builder.module.css";

export type ChildDraft = {
  tag: string;
  emoji: string;
  color: string;
};

type ChildBuilderProps = {
  usedEmojis: string[];
  usedColors: string[];
  editing: Child | null;
  onAdd: (draft: ChildDraft) => void;
  onSave: (child: Child) => void;
  onRemove: (childId: string) => void;
  onCancel: () => void;
};

export function ChildBuilder({
  usedEmojis,
  usedColors,
  editing,
  onAdd,
  onSave,
  onRemove,
  onCancel,
}: ChildBuilderProps) {
  const [emoji, setEmoji] = useState<string | null>(editing?.emoji ?? null);
  const [tag, setTag] = useState(editing?.tag ?? "");
  const [tagTouched, setTagTouched] = useState(editing !== null);
  const [pickedColor, setPickedColor] = useState<string | null>(
    editing?.color ?? null,
  );

  // Preselected so color is an optional tap: emoji + add is enough.
  const color = pickedColor ?? nextUnusedColor(usedColors);

  const pickEmoji = (picked: CuratedEmoji) => {
    setEmoji(picked.emoji);
    if (!tagTouched) {
      setTag(picked.name);
    }
  };

  const canSubmit = emoji !== null && tag.trim().length > 0;

  return (
    <form
      className={styles.builder}
      onSubmit={(event) => {
        event.preventDefault();
        if (emoji === null || !canSubmit) {
          return;
        }
        const draft = { tag: tag.trim(), emoji, color };
        if (editing) {
          onSave({ ...editing, ...draft });
        } else {
          onAdd(draft);
        }
      }}
    >
      <div className={styles.previewRow}>
        {emoji ? (
          <ChildAvatar emoji={emoji} color={color} size="large" />
        ) : (
          <span className={styles.previewEmpty} aria-hidden="true">
            ?
          </span>
        )}
        <div className={styles.tagField}>
          <label className={styles.tagLabel} htmlFor="child-tag">
            Apodo
          </label>
          <input
            id="child-tag"
            className={styles.tagInput}
            type="text"
            value={tag}
            maxLength={20}
            placeholder="Toca un emoji"
            autoComplete="off"
            onChange={(event) => {
              setTag(event.target.value);
              setTagTouched(true);
            }}
          />
          <p className={styles.hint}>Nada de nombres reales</p>
        </div>
      </div>

      <fieldset className={styles.picker}>
        <legend className={styles.pickerLegend}>Elige un emoji</legend>
        <div className={styles.emojiGrid}>
          {CURATED_EMOJIS.map((entry) => {
            const selected = emoji === entry.emoji;
            const used = usedEmojis.includes(entry.emoji);
            return (
              <button
                key={entry.emoji}
                type="button"
                className={
                  selected
                    ? `${styles.emojiCell} ${styles.selected}`
                    : used
                      ? `${styles.emojiCell} ${styles.used}`
                      : styles.emojiCell
                }
                aria-pressed={selected}
                aria-label={used ? `${entry.name} (en uso)` : entry.name}
                onClick={() => pickEmoji(entry)}
              >
                {entry.emoji}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={styles.picker}>
        <legend className={styles.pickerLegend}>Elige un color</legend>
        <div className={styles.colorRow}>
          {AVATAR_COLORS.map((entry) => (
            <button
              key={entry.color}
              type="button"
              className={
                color === entry.color
                  ? `${styles.swatch} ${styles.swatchSelected}`
                  : styles.swatch
              }
              style={{ background: entry.color }}
              aria-pressed={color === entry.color}
              aria-label={entry.name}
              onClick={() => setPickedColor(entry.color)}
            />
          ))}
        </div>
      </fieldset>

      {editing ? (
        <div className={styles.editActions}>
          <button type="submit" className={styles.save} disabled={!canSubmit}>
            Guardar
          </button>
          <button
            type="button"
            className={styles.remove}
            onClick={() => onRemove(editing.id)}
          >
            Quitar
          </button>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancelar
          </button>
        </div>
      ) : (
        <button type="submit" className={styles.add} disabled={!canSubmit}>
          Añadir a la clase
        </button>
      )}
    </form>
  );
}
