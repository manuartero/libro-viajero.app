import { useId, useState } from "react";
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

function cellLabel({ name, used }: { name: string; used: boolean }) {
  if (used) {
    return `${name} (en uso)`;
  }
  return name;
}

// Real radios in a real fieldset: the browser gives the grid arrow keys, one
// tab stop instead of twenty, and "exactly one of these". Each cell is a
// label wrapping a visually hidden input, because the glyph has to live in
// markup an input cannot hold.
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
  const groupName = useId();
  const gridId = useId();

  const panel = EMOJI_PANELS[panelIndex];

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.pickerLegend}>Elige un emoji</legend>
      <div className={styles.panelBar}>
        {/* Live, because the arrow swaps twenty options while focus stays on
            the arrow itself — otherwise nothing says the panel changed.
            aria-live is a property, not a role: this is not a second
            role="status", which the dashboard asserts it owns exactly one of. */}
        <span className={styles.panelLabel} aria-live="polite">
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
          aria-controls={gridId}
          onClick={() =>
            setPanelIndex((prev) => (prev + 1) % EMOJI_PANELS.length)
          }
        >
          ›
        </button>
      </div>
      <div id={gridId} className={styles.emojiGrid}>
        {panel.emojis.map((entry) => {
          const selected = selectedEmoji === entry.emoji;
          const used = usedEmojis.includes(entry.emoji);
          return (
            <label key={entry.emoji} className={cellClass({ selected, used })}>
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
