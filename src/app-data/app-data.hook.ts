import { useState } from "react";
import type { AppData } from "src/app-data/app-data.model";
import type { Project } from "src/project/project.model";
import { getAppData, saveAppData } from "src/services/storage.service";

const loadAppData = (): AppData => {
  const stored = getAppData();
  const hasActive = stored.projects.some(
    (p) => p.id === stored.activeProjectId,
  );
  if (stored.projects.length === 0 || hasActive) {
    return stored;
  }
  // Dangling activeProjectId: heal to the first project rather than boot as
  // a fresh install.
  console.error("libro-viajero: activeProjectId matches no project, healing");
  const healed: AppData = {
    ...stored,
    activeProjectId: stored.projects[0].id,
  };
  saveAppData(healed);
  return healed;
};

export function useAppData() {
  const [appData, setAppData] = useState<AppData>(loadAppData);
  const [saveFailed, setSaveFailed] = useState(false);

  const activeProject =
    appData.projects.find((p) => p.id === appData.activeProjectId) ?? null;

  // A failed save leaves state untouched; the boolean lets callers keep
  // transient UI (forms, the reparto) alive for a retry.
  const persist = (next: AppData) => {
    if (!saveAppData(next)) {
      setSaveFailed(true);
      return false;
    }
    setSaveFailed(false);
    setAppData(next);
    return true;
  };

  const createProject = (project: Project) =>
    persist({
      projects: [...appData.projects, project],
      activeProjectId: project.id,
    });

  const updateProject = (project: Project) =>
    persist({
      ...appData,
      projects: appData.projects.map((p) =>
        p.id === project.id ? project : p,
      ),
    });

  return { appData, activeProject, saveFailed, createProject, updateProject };
}
