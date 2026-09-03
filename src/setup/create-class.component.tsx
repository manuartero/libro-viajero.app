import { useState } from "react";
import { newId } from "src/lib/id";
import type { Project } from "src/project/project.model";
import {
  currentSchoolYear,
  schoolYearFrom,
} from "src/project/school-year.model";
import styles from "./create-class.module.css";

type CreateClassProps = {
  onCreate: (project: Project) => void;
};

export function CreateClass({ onCreate }: CreateClassProps) {
  const [classroomName, setClassroomName] = useState("");
  // Read the calendar once: re-reading it per render would let the clamp drift
  // if the screen is left open across midnight on the 1st of July.
  const [thisCourseStart] = useState(() => currentSchoolYear().start);
  const [yearStart, setYearStart] = useState(thisCourseStart);

  const year = schoolYearFrom(yearStart);
  const canCreate = classroomName.trim().length > 0;
  // Teachers set up this course or the next one — anything further is a typo.
  const minStart = thisCourseStart - 1;
  const maxStart = thisCourseStart + 1;

  return (
    <form
      className={styles.screen}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canCreate) {
          return;
        }
        onCreate({
          id: newId(),
          name: `${classroomName.trim()} ${year.short}`,
          children: [],
          books: [],
          currentAssignments: [],
          history: [],
        });
      }}
    >
      <div className={styles.masthead}>
        <p className={styles.eyebrow}>Libro viajero</p>
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
          onChange={(event) => setClassroomName(event.target.value)}
        />
        <div className={styles.dateline}>
          <button
            type="button"
            className={styles.yearStep}
            aria-label="Curso anterior"
            disabled={yearStart <= minStart}
            onClick={() => setYearStart(yearStart - 1)}
          >
            ‹
          </button>
          <span className={styles.course}>Curso {year.label}</span>
          <button
            type="button"
            className={styles.yearStep}
            aria-label="Curso siguiente"
            disabled={yearStart >= maxStart}
            onClick={() => setYearStart(yearStart + 1)}
          >
            ›
          </button>
        </div>
      </div>

      <footer className={styles.footer}>
        <button type="submit" className={styles.create} disabled={!canCreate}>
          Crear la clase
        </button>
      </footer>
    </form>
  );
}
