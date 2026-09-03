import { useState } from "react";
import { AssignScreen } from "src/assign/assign-screen.component";
import { ClassroomScreen } from "src/classroom/classroom-screen.component";
import { Dashboard } from "src/dashboard/dashboard.component";
import { LibraryScreen } from "src/library/library-screen.component";
import type { View } from "src/navigation/navigation.model";
import { TabBar } from "src/navigation/tab-bar.component";
import { useAppData } from "src/project/app-data.hook";
import { distributeBooks } from "src/project/project.model";
import { downloadAppData } from "src/services/export.service";
import { CreateClass } from "src/setup/create-class.component";
import styles from "./app.module.css";

export function App() {
  const { appData, activeProject, saveFailed, createProject, updateProject } =
    useAppData();
  const [view, setView] = useState<View>("semana");
  // Check-in progress lives here so it survives tab switches: the views
  // below are mutually exclusive branches and Dashboard unmounts on
  // navigation. Persisting it arrives with "Confirmar semana".
  const [returnedChildIds, setReturnedChildIds] = useState<string[]>([]);

  const toggleReturned = (childId: string) => {
    setReturnedChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId],
    );
  };

  const saveError = saveFailed && (
    <p role="alert" className={styles.saveError}>
      No se pudo guardar los cambios. Libera espacio o sal del modo privado y
      vuelve a intentarlo.
    </p>
  );

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
        {view === "semana" && (
          <Dashboard
            project={activeProject}
            returnedChildIds={returnedChildIds}
            onToggleReturned={toggleReturned}
            onNavigate={setView}
            onRepartir={() => setView("repartir")}
            onDownloadData={() => downloadAppData(appData)}
          />
        )}

        {view === "clase" && (
          <ClassroomScreen project={activeProject} onUpdate={updateProject} />
        )}

        {view === "biblioteca" && (
          <LibraryScreen project={activeProject} onUpdate={updateProject} />
        )}

        {view === "repartir" && (
          <AssignScreen
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

      {view !== "repartir" && <TabBar active={view} onSelect={setView} />}
    </div>
  );
}
