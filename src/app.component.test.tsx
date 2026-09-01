import { render, screen, within } from "@testing-library/react";
import { App } from "src/app.component";
import {
  sampleProject,
  stubStorageFailure,
} from "src/services/storage.fixture";
import { createClass } from "src/setup/wizard.fixture";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("<App />", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the created classroom and shows the dashboard", () => {
    render(<App />);

    createClass("Los Caracoles");

    expect(screen.getByText(/^Los Caracoles \d{4}\/\d{2}$/)).toBeDefined();
    const stored = JSON.parse(
      localStorage.getItem("libro-viajero:anonymous") ?? "null",
    );
    expect(stored.projects).toHaveLength(1);
    expect(stored.activeProjectId).toBe(stored.projects[0].id);
  });

  it("restores the classroom on the next boot", () => {
    const firstBoot = render(<App />);
    createClass("Los Caracoles");
    firstBoot.unmount();

    render(<App />);

    expect(screen.getByText(/^Los Caracoles \d{4}\/\d{2}$/)).toBeDefined();
  });

  it("keeps the wizard mounted and warns when saving fails", () => {
    const restore = stubStorageFailure();

    render(<App />);
    createClass("Los Caracoles");

    expect(
      within(screen.getByRole("alert")).getByText(
        /No se pudo guardar la clase/,
      ),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Crear la clase" }),
    ).toBeDefined();

    restore();
  });

  it("self-heals a dangling activeProjectId instead of re-running setup", () => {
    localStorage.setItem(
      "libro-viajero:anonymous",
      JSON.stringify({ projects: [sampleProject], activeProjectId: "gone" }),
    );
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<App />);

    expect(screen.getByText("Clase Caracoles 2026/27")).toBeDefined();
    errorLog.mockRestore();
  });
});
