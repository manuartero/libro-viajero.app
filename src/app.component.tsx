import { useCallback, useState } from "react";
import type { AppView } from "src/app.model";
import { useAppData } from "src/app-data.hook";
import { AssignBooks } from "src/assign/assign-books.component";
import { ClassroomScreen } from "src/classroom/classroom-screen.component";
import { Dashboard } from "src/dashboard/dashboard.component";
import { LibraryScreen } from "src/library/library-screen.component";
import { distributeBooks } from "src/project/project.model";
import { CreateClass } from "src/setup/create-class.component";
import { TabBar } from "src/tab-bar.component";
import styles from "./app.module.css";

export function App() {
  const { activeProject, saveFailed, createProject, updateProject } =
    useAppData();
  const [view, setView] = useState<AppView>("semana");
  // Check-in progress lives here so it survives tab switches: the views
  // below are mutually exclusive branches and Dashboard unmounts on
  // navigation. Persisting it arrives with "Confirmar semana".
  const [returnedChildIds, setReturnedChildIds] = useState<string[]>([]);

  const toggleReturned = useCallback((childId: string) => {
    setReturnedChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId],
    );
  }, []);

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
            returnedChildIds={returnedChildIds}
            onToggleReturned={toggleReturned}
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
            onConfirm={(pairs) => {
              // Leave the reparto only when it actually persisted; on a
              // failed save the flow stays mounted so no tap is lost.
              if (
                updateProject(
                  distributeBooks({ project: activeProject, pairs }),
                )
              ) {
                setView("semana");
              }
            }}
            onBack={() => setView("semana")}
          />
        )}
      </div>
      {view !== "repartir" ? <TabBar active={view} onSelect={setView} /> : null}
    </div>
  );
}
