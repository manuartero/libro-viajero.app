import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "src/app.component";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClass = (name: string) => {
  fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));
};

const addChild = (emojiName: string) => {
  fireEvent.click(screen.getByRole("button", { name: "Añadir un peque" }));
  fireEvent.click(screen.getByRole("radio", { name: emojiName }));
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

  it("adds several peques without reopening the builder", () => {
    render(<App />);
    createClass("Los Caracoles");
    fireEvent.click(screen.getByRole("button", { name: "Clase" }));

    fireEvent.click(screen.getByRole("button", { name: "Añadir un peque" }));
    for (const emojiName of ["Rana", "Zorro", "Panda"]) {
      fireEvent.click(screen.getByRole("radio", { name: emojiName }));
      fireEvent.click(
        screen.getByRole("button", { name: "Añadir peque a la clase" }),
      );
    }

    const stored = JSON.parse(localStorage.getItem("libro-viajero") ?? "null");
    expect(
      stored.projects[0].children.map((c: { tag: string }) => c.tag),
    ).toEqual(["Rana", "Zorro", "Panda"]);
  });

  it("distributes books from the dashboard and returns to the check-in", () => {
    render(<App />);
    setupClassWithRanaAndElmer();

    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));
    // The repartir flow is full-screen: the tab bar is gone.
    expect(screen.queryByRole("navigation")).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "2 semanas" }));
    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    expect(screen.getByRole("navigation", { name: "Secciones" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Rana — Elmer" })).toBeDefined();
    const stored = JSON.parse(localStorage.getItem("libro-viajero") ?? "null");
    expect(stored.projects[0].currentAssignments).toHaveLength(1);
    expect(stored.projects[0].loanWeeks).toBe(2);
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

  it("persists a return and hands the book back to the reparto", () => {
    const { unmount } = render(<App />);
    setupClassWithRanaAndElmer();
    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));
    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    // The book went out today, so Rana is still reading and nothing is due:
    // bringing it back is early, and the app asks before writing it down.
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Rana — Elmer" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, lo devuelve" }));
    expect(
      screen.getByRole("button", { name: "Rana — Elmer", pressed: true }),
    ).toBeDefined();

    // Saved, not held in memory: a fresh boot shows the same card.
    unmount();
    render(<App />);
    expect(
      screen.getByRole("button", { name: "Rana — Elmer", pressed: true }),
    ).toBeDefined();

    // The next reparto starts with Elmer on the tray and Rana without a book;
    // saving it closes the returned loan into history.
    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));
    expect(
      screen.getByRole("button", { name: "Rana, sin libro" }),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    expect(
      screen.getByRole("button", { name: "Rana — Elmer", pressed: false }),
    ).toBeDefined();
    const stored = JSON.parse(localStorage.getItem("libro-viajero") ?? "null");
    expect(stored.projects[0].history).toHaveLength(1);
    expect(stored.projects[0].history[0].returnedOn).toBeDefined();
    expect(stored.projects[0].currentAssignments[0].returnedOn).toBeUndefined();
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
