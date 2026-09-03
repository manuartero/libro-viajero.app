import { useState } from "react";
import type { AppData, Project } from "src/project/project.model";
import { getAppData, saveAppData } from "src/services/storage.service";

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

export function useAppData() {
  const [appData, setAppData] = useState<AppData>(loadAppData);
  const [saveFailed, setSaveFailed] = useState(false);

  const activeProject =
    appData.projects.find((p) => p.id === appData.activeProjectId) ?? null;

  // On a failed save the state stays pre-mutation so nothing on screen
  // pretends to be persisted. Callers get the outcome back so they can keep
  // transient UI (forms, dialogs, the reparto) alive instead of tearing it
  // down over a change that never landed.
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

  // `appData` is exposed whole for "Descargar mis datos": the export is the
  // storage value verbatim, not a view of the active project.
  return { appData, activeProject, saveFailed, createProject, updateProject };
}
