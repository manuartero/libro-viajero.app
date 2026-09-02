import { useState } from "react";
import { Dashboard } from "src/dashboard/dashboard.component";
import type { AppData, Project } from "src/project/project.model";
import { downloadAppData } from "src/services/export.service";
import { getAppData, saveAppData } from "src/services/storage.service";
import { SetupWizard } from "src/setup/setup-wizard.component";
import styles from "./app.module.css";

const loadAppData = (): AppData => {
  const stored = getAppData();
  const hasActive = stored.projects.some(
    (p) => p.id === stored.activeProjectId,
  );
  if (stored.projects.length === 0 || hasActive) {
    return stored;
  }
  // Dangling activeProjectId: projects exist but the pointer matches none.
  // Self-heal to the first project instead of impersonating a fresh install.
  console.error("libro-viajero: activeProjectId matches no project, healing");
  const healed: AppData = {
    ...stored,
    activeProjectId: stored.projects[0].id,
  };
  saveAppData(healed);
  return healed;
};

export function App() {
  const [appData, setAppData] = useState<AppData>(loadAppData);
  const [saveFailed, setSaveFailed] = useState(false);

  const activeProject =
    appData.projects.find((p) => p.id === appData.activeProjectId) ?? null;

  const createProject = (project: Project) => {
    const next: AppData = {
      projects: [...appData.projects, project],
      activeProjectId: project.id,
    };
    if (!saveAppData(next)) {
      setSaveFailed(true);
      return;
    }
    setSaveFailed(false);
    setAppData(next);
  };

  if (!activeProject) {
    return (
      <>
        {saveFailed ? (
          <p role="alert" className={styles.saveError}>
            No se pudo guardar la clase. Libera espacio o sal del modo privado y
            vuelve a intentarlo.
          </p>
        ) : null}
        <SetupWizard onCreate={createProject} />
      </>
    );
  }

  return (
    <Dashboard
      project={activeProject}
      onDownloadData={() => downloadAppData(appData)}
    />
  );
}
