import { useState } from "react";
import { Dashboard } from "src/dashboard/dashboard.component";
import type { AppData, Project } from "src/project/project.model";
import {
  ANONYMOUS_USER_ID,
  getAppData,
  saveAppData,
} from "src/services/storage.service";
import { SetupWizard } from "src/setup/setup-wizard.component";

export function App() {
  const [appData, setAppData] = useState<AppData>(() =>
    getAppData(ANONYMOUS_USER_ID),
  );

  const activeProject =
    appData.projects.find((p) => p.id === appData.activeProjectId) ?? null;

  const createProject = (project: Project) => {
    const next: AppData = {
      projects: [...appData.projects, project],
      activeProjectId: project.id,
    };
    saveAppData({ googleId: ANONYMOUS_USER_ID, data: next });
    setAppData(next);
  };

  if (!activeProject) {
    return <SetupWizard onCreate={createProject} />;
  }

  return <Dashboard project={activeProject} />;
}
