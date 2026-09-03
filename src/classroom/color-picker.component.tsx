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

export function ColorPicker({ selected, onPick }: ColorPickerProps) {
  return (
    <fieldset className={styles.picker}>
      <legend className={styles.pickerLegend}>Elige un color</legend>
      <div className={styles.colorRow}>
        {PALETTE.map((entry) => {
          const isSelected = selected === entry.color;
          return (
            <button
              key={entry.color}
              type="button"
              className={swatchClass(isSelected)}
              style={{ background: entry.color }}
              aria-pressed={isSelected}
              aria-label={entry.name}
              onClick={() => onPick(entry.color)}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
