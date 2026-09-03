import { useState } from "react";
import { newId } from "src/lib/id";
import type { Project } from "src/project/project.model";
import { currentSchoolYear } from "src/project/school-year.model";
import styles from "./create-class.module.css";

type CreateClassProps = {
  onCreate: (project: Project) => void;
};

export function CreateClass({ onCreate }: CreateClassProps) {
  const [classroomName, setClassroomName] = useState("");

  // The course is not a choice: a class is created for the one running now.
  const year = currentSchoolYear();
  const canCreate = classroomName.trim().length > 0;

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
        <p className={styles.course}>Curso {year.label}</p>
      </div>

      <footer className={styles.footer}>
        <button type="submit" className={styles.create} disabled={!canCreate}>
          Crear la clase
        </button>
      </footer>
    </form>
  );
}
