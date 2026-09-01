import type { AppData } from "src/project/project.model";
import { sampleProject, stubStorageFailure } from "src/services/storage.fixture";
import { getAppData, saveAppData } from "src/services/storage.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("getAppData()", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the empty app data when nothing is stored", () => {
    expect(getAppData("g-123")).toEqual({
      projects: [],
      activeProjectId: null,
    });
  });

  it("backs up an unreadable entry and boots fresh", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("libro-viajero:g-123", JSON.stringify({ foo: 1 }));

    expect(getAppData("g-123")).toEqual({
      projects: [],
      activeProjectId: null,
    });

    const backupKey = Object.keys(localStorage).find((key) =>
      key.startsWith("libro-viajero:g-123:backup"),
    );
    expect(backupKey).toBeDefined();
    expect(localStorage.getItem(backupKey ?? "")).toBe(
      JSON.stringify({ foo: 1 }),
    );

    // Corrupted (unparseable) entries take the same recovery path.
    localStorage.setItem("libro-viajero:g-456", "{not json");
    expect(getAppData("g-456")).toEqual({
      projects: [],
      activeProjectId: null,
    });
    errorLog.mockRestore();
  });

  it("keeps each user's data in its own namespace", () => {
    const data: AppData = { projects: [sampleProject], activeProjectId: "p1" };

    saveAppData({ googleId: "g-123", data });

    expect(getAppData("g-123")).toEqual(data);
    expect(getAppData("g-456").projects).toEqual([]);
  });
});

describe("saveAppData()", () => {
  it("reports failure instead of throwing when the write fails", () => {
    const restore = stubStorageFailure();

    const result = saveAppData({
      googleId: "g-123",
      data: { projects: [], activeProjectId: null },
    });

    expect(result).toBe(false);
    restore();
  });
});
