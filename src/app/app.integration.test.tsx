import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "src/app/app.component";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClass = (name: string) => {
  fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));
};

const addChild = (emojiName: string) => {
  fireEvent.click(screen.getByRole("button", { name: emojiName }));
  fireEvent.click(
    screen.getByRole("button", { name: "Añadir peque a la clase" }),
  );
};

// create → add Rana → add Elmer → back to Semana, ready for the reparto.
const setupClassWithRanaAndElmer = () => {
  createClass("Los Caracoles");
  fireEvent.click(screen.getByRole("button", { name: "Clase" }));
  addChild("Rana");
  fireEvent.click(screen.getByRole("button", { name: "Biblioteca" }));
  fireEvent.click(
    screen.getByRole("button", { name: "¿No lo encuentras? Añádelo a mano" }),
  );
  fireEvent.change(screen.getByLabelText("Título"), {
    target: { value: "Elmer" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Añadir libro" }));
  fireEvent.click(screen.getByRole("button", { name: "Semana" }));
};

describe("<App />", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the create-class screen on a fresh boot", () => {
    render(<App />);

    expect(screen.getByLabelText("¿Cómo se llama tu clase?")).toBeDefined();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("creates the class and lands on the dashboard with the tab bar", () => {
    render(<App />);

    createClass("Los Caracoles");

    expect(screen.getByText(/^Los Caracoles \d{4}\/\d{2}$/)).toBeDefined();
    expect(screen.getByRole("navigation", { name: "Secciones" })).toBeDefined();
    expect(
      screen.getByText("Todavía no hay peques en la clase."),
    ).toBeDefined();
    const stored = JSON.parse(localStorage.getItem("libro-viajero") ?? "null");
    expect(stored.projects).toHaveLength(1);
    expect(stored.activeProjectId).toBe(stored.projects[0].id);
  });

  it("navigates between sections with the tab bar", () => {
    render(<App />);
    createClass("Los Caracoles");

    fireEvent.click(screen.getByRole("button", { name: "Clase" }));
    expect(screen.getByText("La lista de clase")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Biblioteca" }));
    expect(screen.getByLabelText("Busca un libro por título")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Semana" }));
    expect(
      screen.getByText("Todavía no hay peques en la clase."),
    ).toBeDefined();
  });

  it("jumps to the Clase tab from the dashboard empty state", () => {
    render(<App />);
    createClass("Los Caracoles");

    fireEvent.click(screen.getByRole("button", { name: "Añadir peques" }));

    expect(screen.getByText("La lista de clase")).toBeDefined();
  });

  it("persists a child added from the Clase tab", () => {
    render(<App />);
    createClass("Los Caracoles");

    fireEvent.click(screen.getByRole("button", { name: "Clase" }));
    addChild("Rana");

    const stored = JSON.parse(localStorage.getItem("libro-viajero") ?? "null");
    expect(stored.projects[0].children).toHaveLength(1);
    expect(stored.projects[0].children[0].tag).toBe("Rana");
  });

  it("distributes books from the dashboard and returns to the check-in", () => {
    render(<App />);
    setupClassWithRanaAndElmer();

    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));
    // The repartir flow is full-screen: the tab bar is gone.
    expect(screen.queryByRole("navigation")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    expect(screen.getByRole("navigation", { name: "Secciones" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Rana — Elmer" })).toBeDefined();
    const stored = JSON.parse(localStorage.getItem("libro-viajero") ?? "null");
    expect(stored.projects[0].currentAssignments).toHaveLength(1);
  });

  it("keeps the reparto mounted when saving fails, so the taps survive a retry", () => {
    render(<App />);
    setupClassWithRanaAndElmer();

    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));
    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));

    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    // Still in the full-screen reparto: the pairing is intact and the teacher
    // sees the warning instead of a silently discarded distribution.
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain(
      "No se pudo guardar",
    );
    expect(
      screen.getByRole("button", { name: "Rana, tiene Elmer" }),
    ).toBeDefined();

    setItem.mockRestore();
    errorLog.mockRestore();

    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    expect(screen.getByRole("navigation", { name: "Secciones" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Rana — Elmer" })).toBeDefined();
  });

  it("keeps check-in progress across tab switches", () => {
    render(<App />);
    setupClassWithRanaAndElmer();
    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));
    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    fireEvent.click(screen.getByRole("button", { name: "Rana — Elmer" }));
    expect(screen.getByRole("status").textContent).toContain("1/1");

    fireEvent.click(screen.getByRole("button", { name: "Clase" }));
    fireEvent.click(screen.getByRole("button", { name: "Semana" }));

    expect(screen.getByRole("status").textContent).toContain("1/1");
  });

  it("keeps the create screen mounted and warns when saving fails", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<App />);
    createClass("Los Caracoles");

    expect(screen.getByRole("alert").textContent).toContain(
      "No se pudo guardar los cambios",
    );
    expect(
      screen.getByRole("button", { name: "Crear la clase" }),
    ).toBeDefined();

    setItem.mockRestore();
    errorLog.mockRestore();
  });

  it("self-heals a dangling activeProjectId instead of re-running setup", () => {
    localStorage.setItem(
      "libro-viajero",
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
