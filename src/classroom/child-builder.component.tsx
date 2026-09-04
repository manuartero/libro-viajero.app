import { useCallback, useId, useState } from "react";
import type { Child, ChildDraft } from "src/child/child.model";
import { nextUnusedColor } from "src/child/child.model";
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
  // Leaves the builder, from either mode: "Cancelar" while editing, "Listo"
  // once a run of additions is done.
  onCancel: () => void;
};

function builderTitle(editing: Child | null) {
  if (editing) {
    return `Editar a ${editing.tag}`;
  }
  return "Añadir un peque";
}

function leaveLabel(editing: Child | null) {
  if (editing) {
    return "Cancelar";
  }
  return "Listo";
}

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
  const titleId = useId();

  // The builder sits below the roster, which is a screenful of chips on a full
  // class: opening it — from the add bar or from a chip tap — has to bring it
  // into view, or the tap looks like it did nothing. Stable identity is
  // load-bearing for the reason ConfirmPanel documents: React re-attaches a ref
  // whose callback changed, so an inline arrow would re-scroll on every render.
  const scrollIn = useCallback((node: HTMLElement | null) => {
    node?.scrollIntoView({ block: "start" });
  }, []);

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
    <section ref={scrollIn} className={styles.panel} aria-labelledby={titleId}>
      {/* Which mode you landed in is not obvious any more: you get here from
          the add bar or from a chip tap, both of them above the fold. */}
      <h2 id={titleId} className={styles.title}>
        {builderTitle(editing)}
      </h2>

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
          </div>
        )}

        {!editing && (
          <button type="submit" className={styles.add} disabled={!canSubmit}>
            Añadir peque a la clase
          </button>
        )}

        <button type="button" className={styles.leave} onClick={onCancel}>
          {leaveLabel(editing)}
        </button>
      </form>
    </section>
  );
}
