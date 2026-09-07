import { useState } from "react";
import { useAppData } from "src/app-data/app-data.hook";
import { AssignScreen, type Reparto } from "src/assign/assign-screen.component";
import { ClassroomScreen } from "src/classroom/classroom-screen.component";
import { DashboardScreen } from "src/dashboard/dashboard-screen.component";
import { LibraryScreen } from "src/library/library-screen.component";
import type { View } from "src/navigation/navigation.model";
import { TabBar } from "src/navigation/tab-bar.component";
import { CreateClassroom } from "src/project/create-classroom.component";
import { distributeBooks, setLoanWeeks } from "src/project/project.model";
import { downloadAppData } from "src/services/export.service";
import styles from "./app.module.css";

export function App() {
  const { appData, activeProject, saveFailed, createProject, updateProject } =
    useAppData();
  const [view, setView] = useState<View>("semana");

  const confirmReparto = ({ pairs, loanWeeks }: Reparto) => {
    if (!activeProject) {
      return;
    }
    const next = setLoanWeeks({
      project: distributeBooks({ project: activeProject, pairs }),
      loanWeeks,
    });
    if (updateProject(next)) {
      setView("semana");
    }
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
        <CreateClassroom onCreate={createProject} />
      </>
    );
  }

  return (
    <div className={styles.shell}>
      {saveError}
      <div className={styles.content}>
        {view === "semana" && (
          <DashboardScreen
            project={activeProject}
            onUpdate={updateProject}
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
            onConfirm={confirmReparto}
            onBack={() => setView("semana")}
          />
        )}
      </div>

      {view !== "repartir" && <TabBar active={view} onSelect={setView} />}
    </div>
  );
}
