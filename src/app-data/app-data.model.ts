import type { Project } from "src/project/project.model";

// The whole persisted value: every project on this device and which one is
// open. Storage reads and writes it verbatim, and "Descargar mis datos"
// exports it as is.
export type AppData = {
  projects: Project[];
  activeProjectId: string | null;
};
