import { useState } from "react";
import type { AppData, Project } from "src/project/project.model";
import {
  ANONYMOUS_USER_ID,
  getAppData,
  saveAppData,
} from "src/services/storage.service";

const loadAppData = (): AppData => {
  const stored = getAppData(ANONYMOUS_USER_ID);
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
  saveAppData({ googleId: ANONYMOUS_USER_ID, data: healed });
  return healed;
};

export function useAppData() {
  const [appData, setAppData] = useState<AppData>(loadAppData);
  const [saveFailed, setSaveFailed] = useState(false);

  const activeProject =
    appData.projects.find((p) => p.id === appData.activeProjectId) ?? null;

  // On a failed save the state stays pre-mutation so nothing on screen
  // pretends to be persisted.
  const persist = (next: AppData) => {
    if (!saveAppData({ googleId: ANONYMOUS_USER_ID, data: next })) {
      setSaveFailed(true);
      return;
    }
    setSaveFailed(false);
    setAppData(next);
  };

  const createProject = (project: Project) => {
    persist({
      projects: [...appData.projects, project],
      activeProjectId: project.id,
    });
  };

  const updateProject = (project: Project) => {
    persist({
      ...appData,
      projects: appData.projects.map((p) =>
        p.id === project.id ? project : p,
      ),
    });
  };

  return { activeProject, saveFailed, createProject, updateProject };
}
