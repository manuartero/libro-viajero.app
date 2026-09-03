import { useId } from "react";
import { PALETTE } from "src/palette/palette.data";
import styles from "./color-picker.module.css";

type ColorPickerProps = {
  selected: string;
  onPick: (color: string) => void;
};

function swatchClass(selected: boolean) {
  if (selected) {
    return `${styles.swatch} ${styles.swatchSelected}`;
  }
  return styles.swatch;
}

// Real radios in a real fieldset, so the browser owns the arrow keys, the
// single tab stop and the "exactly one of these" semantics. The input is the
// swatch: it is what gets the colour, and it is what takes focus.
export function ColorPicker({ selected, onPick }: ColorPickerProps) {
  const groupName = useId();

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.pickerLegend}>Elige un color</legend>
      <div className={styles.colorRow}>
        {PALETTE.map((entry) => (
          <input
            key={entry.color}
            type="radio"
            name={groupName}
            className={swatchClass(selected === entry.color)}
            style={{ background: entry.color }}
            checked={selected === entry.color}
            aria-label={entry.name}
            onChange={() => onPick(entry.color)}
          />
        ))}
      </div>
    </fieldset>
  );
}
