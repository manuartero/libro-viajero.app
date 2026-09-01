import { useState } from "react";
import type { AppView } from "src/app.model";
import { useAppData } from "src/app-data.hook";
import { AssignBooks } from "src/assign/assign-books.component";
import { ClassroomScreen } from "src/classroom/classroom-screen.component";
import { Dashboard } from "src/dashboard/dashboard.component";
import { LibraryScreen } from "src/library/library-screen.component";
import { CreateClass } from "src/setup/create-class.component";
import { TabBar } from "src/tab-bar.component";
import styles from "./app.module.css";

export function App() {
  const { activeProject, saveFailed, createProject, updateProject } =
    useAppData();
  const [view, setView] = useState<AppView>("semana");

  const saveError = saveFailed ? (
    <p role="alert" className={styles.saveError}>
      No se pudo guardar los cambios. Libera espacio o sal del modo privado y
      vuelve a intentarlo.
    </p>
  ) : null;

  if (!activeProject) {
    return (
      <>
        {saveError}
        <CreateClass onCreate={createProject} />
      </>
    );
  }

  return (
    <div className={styles.shell}>
      {saveError}
      <div className={styles.content}>
        {view === "semana" ? (
          <Dashboard
            project={activeProject}
            onNavigate={setView}
            onRepartir={() => setView("repartir")}
          />
        ) : view === "clase" ? (
          <ClassroomScreen project={activeProject} onUpdate={updateProject} />
        ) : view === "biblioteca" ? (
          <LibraryScreen project={activeProject} onUpdate={updateProject} />
        ) : (
          <AssignBooks
            project={activeProject}
            onConfirm={(assignments) => {
              updateProject({
                ...activeProject,
                currentAssignments: assignments,
              });
              setView("semana");
            }}
            onBack={() => setView("semana")}
          />
        )}
      </div>
      {view !== "repartir" ? <TabBar active={view} onSelect={setView} /> : null}
    </div>
  );
}
