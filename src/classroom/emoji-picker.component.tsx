import { useCallback, useId, useState } from "react";
import { type CuratedEmoji, EMOJI_PANELS } from "src/child/avatar-catalog.data";
import styles from "./emoji-picker.module.css";

type EmojiPickerProps = {
  selectedEmoji: string | null;
  usedEmojis: string[];
  onPick: (picked: CuratedEmoji) => void;
};

const EMOJI_TRAY = EMOJI_PANELS.flatMap((panel) => panel.emojis);

function cellClass({ selected, used }: { selected: boolean; used: boolean }) {
  if (selected) {
    return `${styles.emojiCell} ${styles.selected}`;
  }
  if (used) {
    return `${styles.emojiCell} ${styles.used}`;
  }
  return styles.emojiCell;
}

function cellLabel({ name, used }: { name: string; used: boolean }) {
  if (used) {
    return `${name} (en uso)`;
  }
  return name;
}

export function EmojiPicker({
  selectedEmoji,
  usedEmojis,
  onPick,
}: EmojiPickerProps) {
  const groupName = useId();

  // Anchored to the emoji the picker opened with, not the live selection, so
  // the ref is attached (and scrolls) once rather than on every pick.
  const [openedWith] = useState(selectedEmoji);
  const revealOnOpen = useCallback((node: HTMLElement | null) => {
    node?.scrollIntoView({ block: "nearest" });
  }, []);

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.legend}>Elige un emoji</legend>
      <div className={styles.tray}>
        {EMOJI_TRAY.map((entry) => {
          const selected = selectedEmoji === entry.emoji;
          const used = usedEmojis.includes(entry.emoji);
          const reveal = entry.emoji === openedWith ? revealOnOpen : undefined;
          return (
            <label
              key={entry.emoji}
              ref={reveal}
              className={cellClass({ selected, used })}
            >
              <input
                type="radio"
                name={groupName}
                className={styles.cellInput}
                checked={selected}
                aria-label={cellLabel({ name: entry.name, used })}
                onChange={() => onPick(entry)}
              />
              <span aria-hidden="true">{entry.emoji}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
