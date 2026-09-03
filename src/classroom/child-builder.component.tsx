import { useState } from "react";
import { nextUnusedColor } from "src/child/avatar-catalog.data";
import type { Child, ChildDraft } from "src/child/child.model";
import { ChildAvatar } from "src/child/child-avatar.component";
import styles from "./child-builder.module.css";
import { ColorPicker } from "./color-picker.component";
import { EmojiPicker } from "./emoji-picker.component";
import { TagField } from "./tag-field.component";

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

  const canSubmit = emoji !== null && tag.trim().length > 0;

  const submit = () => {
    if (emoji === null || !canSubmit) {
      return;
    }
    // maxLength on the input is advisory only — enforce the Child
    // invariant (tag ≤ 20 chars) at the boundary too.
    const draft = { tag: tag.trim().slice(0, 20), emoji, color };
    if (editing) {
      onSave({ ...editing, ...draft });
      return;
    }
    onAdd(draft);
  };

  return (
    <form
      className={styles.builder}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className={styles.previewRow}>
        {emoji && <ChildAvatar emoji={emoji} color={color} size="large" />}

        {!emoji && (
          <span className={styles.previewEmpty} aria-hidden="true">
            ?
          </span>
        )}

        <TagField
          tag={tag}
          hasEmoji={emoji !== null}
          onChange={(next) => {
            setTag(next);
            setTagTouched(true);
          }}
        />
      </div>

      <EmojiPicker
        selectedEmoji={emoji}
        usedEmojis={usedEmojis}
        onPick={(picked) => {
          setEmoji(picked.emoji);
          if (!tagTouched) {
            setTag(picked.name);
          }
        }}
      />

      <ColorPicker selected={color} onPick={setPickedColor} />

      {editing && (
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
      )}

      {!editing && (
        <button type="submit" className={styles.add} disabled={!canSubmit}>
          Añadir peque a la clase
        </button>
      )}
    </form>
  );
}
