import { type FormEvent, useState } from "react";
import { createProject, type Project } from "src/project/project.model";
import { currentSchoolYear } from "src/project/school-year.model";
import styles from "./create-classroom.module.css";

type CreateClassroomProps = {
  onCreate: (project: Project) => void;
};

export function CreateClassroom({ onCreate }: CreateClassroomProps) {
  const [classroomName, setClassroomName] = useState("");

  const year = currentSchoolYear();
  const canCreate = classroomName.trim().length > 0;

  const createClassroom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate) {
      return;
    }
    onCreate(createProject({ classroomName, year }));
  };

  return (
    <form className={styles.screen} onSubmit={createClassroom}>
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
