import { useState } from "react";
import { type CuratedEmoji, EMOJI_PANELS } from "src/child/avatar-catalog.data";
import styles from "./emoji-picker.module.css";

type EmojiPickerProps = {
  selectedEmoji: string | null;
  usedEmojis: string[];
  onPick: (picked: CuratedEmoji) => void;
};

function cellClass({ selected, used }: { selected: boolean; used: boolean }) {
  if (selected) {
    return `${styles.emojiCell} ${styles.selected}`;
  }
  if (used) {
    return `${styles.emojiCell} ${styles.used}`;
  }
  return styles.emojiCell;
}

export function EmojiPicker({
  selectedEmoji,
  usedEmojis,
  onPick,
}: EmojiPickerProps) {
  // Open on the panel holding the selected emoji, so it shows selected.
  const [panelIndex, setPanelIndex] = useState(() => {
    const found = EMOJI_PANELS.findIndex((candidate) =>
      candidate.emojis.some((entry) => entry.emoji === selectedEmoji),
    );
    return found === -1 ? 0 : found;
  });

  const panel = EMOJI_PANELS[panelIndex];

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.pickerLegend}>Elige un emoji</legend>
      <div className={styles.panelBar}>
        <span className={styles.panelLabel}>
          {panel.label}
          <span className={styles.panelCount}>
            {" "}
            · {panelIndex + 1}/{EMOJI_PANELS.length}
          </span>
        </span>
        <button
          type="button"
          className={styles.panelNext}
          aria-label="Más emojis"
          onClick={() =>
            setPanelIndex((prev) => (prev + 1) % EMOJI_PANELS.length)
          }
        >
          ›
        </button>
      </div>
      <div className={styles.emojiGrid}>
        {panel.emojis.map((entry) => {
          const selected = selectedEmoji === entry.emoji;
          const used = usedEmojis.includes(entry.emoji);
          return (
            <button
              key={entry.emoji}
              type="button"
              className={cellClass({ selected, used })}
              aria-pressed={selected}
              aria-label={used ? `${entry.name} (en uso)` : entry.name}
              onClick={() => onPick(entry)}
            >
              {entry.emoji}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
