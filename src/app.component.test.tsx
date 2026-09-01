import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "src/app.component";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClass = (name: string) => {
  fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: "Añadir peques →" }));
  fireEvent.click(screen.getByRole("button", { name: "Rana" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Añadir peque a la clase" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Añadir libros →" }));
  fireEvent.click(
    screen.getByRole("button", { name: "¿No lo encuentras? Añádelo a mano" }),
  );
  fireEvent.change(screen.getByLabelText("Título"), {
    target: { value: "Elmer" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Añadir libro" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Elegir lector para cada libro →" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
  fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));
};

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
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<App />);
    createClass("Los Caracoles");

    expect(screen.getByRole("alert").textContent).toContain(
      "No se pudo guardar la clase",
    );
    expect(
      screen.getByRole("button", { name: "Crear la clase" }),
    ).toBeDefined();

    setItem.mockRestore();
    errorLog.mockRestore();
  });

  it("self-heals a dangling activeProjectId instead of re-running setup", () => {
    localStorage.setItem(
      "libro-viajero:anonymous",
      JSON.stringify({
        projects: [
          {
            id: "p1",
            name: "Clase Caracoles 2026/27",
            children: [],
            books: [],
            currentAssignments: [],
            history: [],
          },
        ],
        activeProjectId: "gone",
      }),
    );
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<App />);

    expect(screen.getByText("Clase Caracoles 2026/27")).toBeDefined();
    errorLog.mockRestore();
  });
});
