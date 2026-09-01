import { act, renderHook } from "@testing-library/react";
import { useAppData } from "src/app-data.hook";
import type { Project } from "src/project/project.model";
import { beforeEach, describe, expect, it, vi } from "vitest";

const project = (id: string): Project => ({
  id,
  name: `Clase ${id}`,
  children: [],
  books: [],
  currentAssignments: [],
  history: [],
});

describe("useAppData()", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with no active project on a fresh boot", () => {
    const { result } = renderHook(() => useAppData());

    expect(result.current.activeProject).toBeNull();
    expect(result.current.saveFailed).toBe(false);
  });

  it("creates a project, activates it and persists it", () => {
    const { result } = renderHook(() => useAppData());

    act(() => result.current.createProject(project("p1")));

    expect(result.current.activeProject?.id).toBe("p1");
    const stored = JSON.parse(
      localStorage.getItem("libro-viajero:anonymous") ?? "null",
    );
    expect(stored.activeProjectId).toBe("p1");
  });

  it("updates the active project in place", () => {
    const { result } = renderHook(() => useAppData());
    act(() => result.current.createProject(project("p1")));

    act(() =>
      result.current.updateProject({
        ...project("p1"),
        name: "Clase renombrada",
      }),
    );

    expect(result.current.activeProject?.name).toBe("Clase renombrada");
    const stored = JSON.parse(
      localStorage.getItem("libro-viajero:anonymous") ?? "null",
    );
    expect(stored.projects[0].name).toBe("Clase renombrada");
  });

  it("keeps prior state and flags the failure when saving fails", () => {
    const { result } = renderHook(() => useAppData());
    act(() => result.current.createProject(project("p1")));

    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    act(() =>
      result.current.updateProject({ ...project("p1"), name: "Perdida" }),
    );

    expect(result.current.saveFailed).toBe(true);
    expect(result.current.activeProject?.name).toBe("Clase p1");

    setItem.mockRestore();
    errorLog.mockRestore();
  });

  it("self-heals a dangling activeProjectId", () => {
    localStorage.setItem(
      "libro-viajero:anonymous",
      JSON.stringify({ projects: [project("p1")], activeProjectId: "gone" }),
    );
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useAppData());

    expect(result.current.activeProject?.id).toBe("p1");
    errorLog.mockRestore();
  });
});
