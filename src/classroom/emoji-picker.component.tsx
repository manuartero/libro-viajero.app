import { useCallback, useId, useState } from "react";
import { type CuratedEmoji, EMOJI_PANELS } from "src/child/avatar-catalog.data";
import styles from "./emoji-picker.module.css";

type EmojiPickerProps = {
  selectedEmoji: string | null;
  usedEmojis: string[];
  onPick: (picked: CuratedEmoji) => void;
};

// One drawer of sixty, in the catalog's own order: animals, then nature, then
// objects. The panel labels stay in the data as the reason for that order and
// stop being chrome — a teacher hunting for an emoji a five-year-old will like
// is browsing, not navigating a taxonomy, and browsing wants one surface. A
// flick also beats the two taps and a re-scan that reaching an object used to
// cost, and nothing stays hidden behind a chevron nobody's eye lands on.
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

// Real radios in a real fieldset: the browser gives the grid arrow keys, one
// tab stop instead of sixty, and "exactly one of these". Each cell is a
// label wrapping a visually hidden input, because the glyph has to live in
// markup an input cannot hold.
export function EmojiPicker({
  selectedEmoji,
  usedEmojis,
  onPick,
}: EmojiPickerProps) {
  const groupName = useId();

  // The tray shows four of its twelve rows, so an emoji chosen earlier can sit
  // below the fold — reveal it on open. Anchoring the ref to the emoji the
  // picker *opened* with, rather than to the live selection, is what keeps that
  // to once: tapping another cell changes selectedEmoji but not this, so React
  // never re-attaches the callback. Same reasoning as ChildBuilder's scrollIn.
  const [openedWith] = useState(selectedEmoji);
  const revealOnOpen = useCallback((node: HTMLElement | null) => {
    // "nearest" moves the tray the minimum needed and leaves the page where
    // the builder's own scrollIntoView parks it.
    node?.scrollIntoView({ block: "nearest" });
  }, []);

  return (
    <fieldset className={styles.picker}>
      {/* Off-screen, not gone: the "?" avatar and the "Toca un emoji" nickname
          directly above already say what this is for, so a visible legend was
          the third instruction on one screen. Keeping a real <legend> keeps
          the radio group named in the accessibility tree, which an aria-label
          on the fieldset would only imitate. */}
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
