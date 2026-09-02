import type { AppData } from "src/project/project.model";
import {
  sampleProject,
  stubStorageFailure,
} from "src/services/storage.fixture";
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

  it("moves an unreadable entry to the backup key and boots fresh", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("libro-viajero:v1:g-123", JSON.stringify({ foo: 1 }));

    expect(getAppData("g-123")).toEqual({
      projects: [],
      activeProjectId: null,
    });

    expect(localStorage.getItem("libro-viajero:v1:g-123:backup")).toBe(
      JSON.stringify({ foo: 1 }),
    );
    // Moved, not copied: the next boot must not back it up again.
    expect(localStorage.getItem("libro-viajero:v1:g-123")).toBeNull();

    // Corrupted (unparseable) entries take the same recovery path.
    localStorage.setItem("libro-viajero:v1:g-456", "{not json");
    expect(getAppData("g-456")).toEqual({
      projects: [],
      activeProjectId: null,
    });
    expect(localStorage.getItem("libro-viajero:v1:g-456:backup")).toBe(
      "{not json",
    );
    errorLog.mockRestore();
  });

  it("keeps the previous backup when a second entry is unreadable", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("libro-viajero:v1:g-123", "first");
    getAppData("g-123");
    localStorage.setItem("libro-viajero:v1:g-123", "second");
    getAppData("g-123");

    expect(localStorage.getItem("libro-viajero:v1:g-123:backup")).toBe(
      "second",
    );
    expect(localStorage.getItem("libro-viajero:v1:g-123:backup-prev")).toBe(
      "first",
    );
    errorLog.mockRestore();
  });

  it("leaves the unreadable entry in place when the backup write fails", () => {
    localStorage.setItem("libro-viajero:v1:g-123", "{not json");
    const restore = stubStorageFailure();

    expect(getAppData("g-123")).toEqual({
      projects: [],
      activeProjectId: null,
    });
    expect(localStorage.getItem("libro-viajero:v1:g-123")).toBe("{not json");
    restore();
  });

  it("migrates data stored under the unversioned legacy key", () => {
    const data: AppData = { projects: [sampleProject], activeProjectId: "p1" };
    localStorage.setItem("libro-viajero:g-123", JSON.stringify(data));

    expect(getAppData("g-123")).toEqual(data);
    expect(localStorage.getItem("libro-viajero:v1:g-123")).toBe(
      JSON.stringify(data),
    );
    expect(localStorage.getItem("libro-viajero:g-123")).toBeNull();
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
