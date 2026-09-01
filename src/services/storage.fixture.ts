import type { Project } from "src/project/project.model";
import { vi } from "vitest";

export const sampleProject: Project = {
  id: "p1",
  name: "Clase Caracoles 2026/27",
  children: [],
  books: [],
  currentAssignments: [],
  history: [],
};

// Simulates a blocked/full localStorage; returns the restore function.
export const stubStorageFailure = () => {
  const setItem = vi
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
  const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
  return () => {
    setItem.mockRestore();
    errorLog.mockRestore();
  };
};
