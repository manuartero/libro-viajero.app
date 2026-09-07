import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "src/app.component";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Full flows (create a class, add a child, run the reparto, record a return)
// live in e2e/ and run in a real browser. This file covers only the wiring
// that belongs to <App /> itself: which screen the view state shows, and what
// happens to that screen when a save does not persist.

const createClass = (name: string) => {
  fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));
};

// create → add Rana → add Elmer → back to Semana, ready for the reparto.
const setupClassWithRanaAndElmer = () => {
  createClass("Los Caracoles");
  fireEvent.click(screen.getByRole("button", { name: "Clase" }));
  fireEvent.click(screen.getByRole("button", { name: "Añadir un peque" }));
  fireEvent.click(screen.getByRole("radio", { name: "Rana" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Añadir peque a la clase" }),
  );
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

const failEverySave = () => {
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

describe("<App />", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("switches screens with the tab bar", () => {
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

  it("keeps the create screen mounted and warns when saving fails", () => {
    const restore = failEverySave();

    render(<App />);
    createClass("Los Caracoles");

    expect(screen.getByRole("alert").textContent).toContain(
      "No se pudo guardar los cambios",
    );
    expect(
      screen.getByRole("button", { name: "Crear la clase" }),
    ).toBeDefined();

    restore();
  });

  it("keeps the reparto mounted when saving fails, so the taps survive a retry", () => {
    render(<App />);
    setupClassWithRanaAndElmer();

    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));
    // The repartir flow is full-screen: the tab bar is gone.
    expect(screen.queryByRole("navigation")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));

    const restore = failEverySave();
    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    // Still in the reparto: the pairing is intact and the teacher sees the
    // warning instead of a silently discarded distribution.
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain(
      "No se pudo guardar",
    );
    expect(
      screen.getByRole("button", { name: "Rana, tiene Elmer" }),
    ).toBeDefined();

    restore();
    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    expect(screen.getByRole("navigation", { name: "Secciones" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Rana — Elmer" })).toBeDefined();
  });
});
