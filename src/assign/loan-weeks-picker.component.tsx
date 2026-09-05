import { useId } from "react";
import {
  fridayLabel,
  LOAN_WEEKS_OPTIONS,
  type LoanWeeks,
  returnFridayFor,
} from "src/project/loan.model";
import styles from "./loan-weeks-picker.module.css";

type LoanWeeksPickerProps = {
  value: LoanWeeks;
  onChange: (loanWeeks: LoanWeeks) => void;
};

function weeksLabel(weeks: LoanWeeks) {
  if (weeks === 1) {
    return "1 semana";
  }
  return "2 semanas";
}

// Asked where it matters — while handing books out — and answered in dates,
// since "2 semanas" is abstract and "vuelve el viernes 18" is not. One value
// for the whole class; it saves with the reparto.
export function LoanWeeksPicker({ value, onChange }: LoanWeeksPickerProps) {
  const groupName = useId();
  const returnFriday = returnFridayFor({ loanWeeks: value, today: new Date() });

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.legend}>
        ¿Cuánto tiempo se llevan el libro?
      </legend>
      <div className={styles.chips}>
        {LOAN_WEEKS_OPTIONS.map((weeks) => (
          <label key={weeks} className={styles.chip}>
            <input
              type="radio"
              name={groupName}
              className={styles.chipInput}
              checked={value === weeks}
              onChange={() => onChange(weeks)}
            />
            {weeksLabel(weeks)}
          </label>
        ))}
      </div>
      <p className={styles.note}>
        Para toda la clase. Un libro que sale hoy vuelve el{" "}
        {fridayLabel(returnFriday)}.
      </p>
    </fieldset>
  );
}
