import type { Project } from "src/project/project.model";

export type AppData = {
  projects: Project[];
  activeProjectId: string | null;
};
