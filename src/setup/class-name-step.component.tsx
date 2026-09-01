import styles from "./class-name-step.module.css";

type ClassNameStepProps = {
  classroomName: string;
  yearLabel: string;
  onClassroomNameChange: (name: string) => void;
  onNext: () => void;
};

export function ClassNameStep({
  classroomName,
  yearLabel,
  onClassroomNameChange,
  onNext,
}: ClassNameStepProps) {
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
        <p className={styles.eyebrow}>Libro viajero · Paso 1 de 4</p>
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
        <p className={styles.course}>Curso {yearLabel}</p>
      </div>

      <footer className={styles.footer}>
        <button type="submit" className={styles.next} disabled={!canContinue}>
          Añadir peques →
        </button>
      </footer>
    </form>
  );
}
