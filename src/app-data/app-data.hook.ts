import { useState } from "react";
import { type AppData, activeProjectOf } from "src/app-data/app-data.model";
import type { Project } from "src/project/project.model";
import {
  backUpAppData,
  getAppData,
  saveAppData,
} from "src/services/storage.service";

const loadAppData = () => {
  const stored = getAppData();
  if (stored.projects.length === 0 || activeProjectOf(stored)) {
    return stored;
  }
  // Dangling activeProjectId: heal to the first project rather than boot as
  // a fresh install.
  console.error("libro-viajero: activeProjectId matches no project, healing");
  const healed = { ...stored, activeProjectId: stored.projects[0].id };
  saveAppData(healed);
  return healed;
};

export function useAppData() {
  const [appData, setAppData] = useState<AppData>(loadAppData);
  const [saveFailed, setSaveFailed] = useState(false);

  const activeProject = activeProjectOf(appData) ?? null;

  // A failed save leaves state untouched; the boolean lets callers keep
  // transient UI (forms, the reparto) alive for a retry.
  const persist = (next: AppData) => {
    const saved = saveAppData(next);
    setSaveFailed(!saved);
    if (saved) {
      setAppData(next);
    }
    return saved;
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

  const replaceAppData = (next: AppData) => {
    if (appData.projects.length > 0) {
      backUpAppData();
    }
    return persist(next);
  };

  return {
    appData,
    activeProject,
    saveFailed,
    createProject,
    updateProject,
    replaceAppData,
  };
}
