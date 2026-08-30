import { schoolYearFrom } from "src/project/school-year";
import styles from "./class-name-step.module.css";

type ClassNameStepProps = {
  classroomName: string;
  yearStart: number;
  onClassroomNameChange: (name: string) => void;
  onYearStartChange: (start: number) => void;
  onNext: () => void;
};

export function ClassNameStep({
  classroomName,
  yearStart,
  onClassroomNameChange,
  onYearStartChange,
  onNext,
}: ClassNameStepProps) {
  const year = schoolYearFrom(yearStart);
  const canContinue = classroomName.trim().length > 0;

  return (
    <form
      className={styles.screen}
      onSubmit={(event) => {
        event.preventDefault();
        if (canContinue) {
          onNext();
        }
      }}
    >
      <div className={styles.masthead}>
        <p className={styles.eyebrow}>Libro viajero · Paso 1 de 2</p>
        <label className={styles.question} htmlFor="classroom-name">
          ¿Cómo se llama tu clase?
        </label>
        <input
          id="classroom-name"
          className={styles.nameInput}
          type="text"
          value={classroomName}
          maxLength={30}
          placeholder="Clase Caracoles"
          autoComplete="off"
          onChange={(event) => onClassroomNameChange(event.target.value)}
        />
        <div className={styles.dateline}>
          <button
            type="button"
            className={styles.yearStep}
            aria-label="Curso anterior"
            onClick={() => onYearStartChange(yearStart - 1)}
          >
            ‹
          </button>
          <span className={styles.course}>Curso {year.label}</span>
          <button
            type="button"
            className={styles.yearStep}
            aria-label="Curso siguiente"
            onClick={() => onYearStartChange(yearStart + 1)}
          >
            ›
          </button>
        </div>
      </div>

      <footer className={styles.footer}>
        <button type="submit" className={styles.next} disabled={!canContinue}>
          Añadir peques →
        </button>
      </footer>
    </form>
  );
}
