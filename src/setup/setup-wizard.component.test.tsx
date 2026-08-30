import { fireEvent, render, screen } from "@testing-library/react";
import { SetupWizard } from "src/setup/setup-wizard.component";
import { describe, expect, it, vi } from "vitest";

const nameTheClass = (name: string) => {
  fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: "Añadir peques →" }));
};

const addChild = (emojiName: string) => {
  fireEvent.click(screen.getByRole("button", { name: emojiName }));
  fireEvent.click(screen.getByRole("button", { name: "Añadir a la clase" }));
};

const goToBooks = () => {
  fireEvent.click(screen.getByRole("button", { name: "Añadir libros →" }));
};

// Manual entry keeps wizard-level tests free of fetch stubbing.
const addBookManually = (title: string) => {
  fireEvent.click(
    screen.getByRole("button", { name: "¿No lo encuentras? Añádelo a mano" }),
  );
  fireEvent.change(screen.getByLabelText("Título"), {
    target: { value: title },
  });
  fireEvent.click(screen.getByRole("button", { name: "Añadir libro" }));
};

const goToAssign = () => {
  fireEvent.click(
    screen.getByRole("button", { name: "Elegir lector para cada libro →" }),
  );
};

describe("<SetupWizard />", () => {
  it("cannot leave the name step without a classroom name", () => {
    render(<SetupWizard onCreate={() => {}} />);

    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Añadir peques →",
      }).disabled,
    ).toBe(true);
  });

  it("cannot continue to books without children", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");

    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Añadir libros →",
      }).disabled,
    ).toBe(true);
  });

  it("cannot leave the books step until books match children", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");
    addChild("Rana");
    addChild("Dino");
    goToBooks();

    const next = () =>
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Elegir lector para cada libro →",
      });
    addBookManually("Elmer");
    expect(next().disabled).toBe(true);

    addBookManually("La oruga glotona");
    expect(next().disabled).toBe(false);
  });

  it("creates the project with books, assignments, and the school year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 30)); // Sunday Aug 30, 2026
    const onCreate = vi.fn();
    render(<SetupWizard onCreate={onCreate} />);

    nameTheClass("Los Caracoles");
    addChild("Rana");
    addChild("Dino");
    goToBooks();
    addBookManually("Elmer");
    addBookManually("La oruga glotona");
    goToAssign();

    // Auto-advancing active child: two book taps pair everyone in order.
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Crear la clase" })
        .disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
    fireEvent.click(
      screen.getByRole("button", { name: "La oruga glotona, asignar" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    const project = onCreate.mock.calls[0][0];
    expect(project.name).toBe("Los Caracoles 2026/27");
    expect(project.children).toHaveLength(2);
    expect(project.books).toHaveLength(2);
    expect(project.history).toEqual([]);

    const childIds = project.children.map((c: { id: string }) => c.id);
    const bookIds = project.books.map((b: { id: string }) => b.id);
    expect(
      project.currentAssignments.map((a: { childId: string }) => a.childId),
    ).toEqual(childIds);
    expect(
      new Set(
        project.currentAssignments.map((a: { bookId: string }) => a.bookId),
      ),
    ).toEqual(new Set(bookIds));
    for (const assignment of project.currentAssignments) {
      expect(assignment.weekStart).toBe("2026-08-24"); // Sunday → previous Monday
    }
    vi.useRealTimers();
  });

  it("keeps books when going back to children and forward again", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");
    addChild("Rana");
    goToBooks();
    addBookManually("Elmer");
    fireEvent.click(
      screen.getByRole("button", { name: "Volver a los peques" }),
    );
    goToBooks();

    expect(screen.getByRole("button", { name: "Elmer, quitar" })).toBeDefined();
  });

  it("re-blocks the books step when a child is removed on a back-trip", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");
    addChild("Rana");
    addChild("Dino");
    goToBooks();
    addBookManually("Elmer");
    addBookManually("La oruga glotona");
    fireEvent.click(
      screen.getByRole("button", { name: "Volver a los peques" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Dino, editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));
    goToBooks();

    expect(screen.getByText("Te sobra 1 libro")).toBeDefined();
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Elegir lector para cada libro →",
      }).disabled,
    ).toBe(true);
  });

  it("unpairs a child when their assigned book is removed on a back-trip", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");
    addChild("Rana");
    goToBooks();
    addBookManually("Elmer");
    goToAssign();
    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
    expect(
      screen.getByRole("button", { name: "Rana, tiene Elmer" }),
    ).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", { name: "Volver a los libros" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Elmer, quitar" }));
    addBookManually("La oruga glotona");
    goToAssign();

    expect(
      screen.getByRole("button", { name: "Rana, sin libro" }),
    ).toBeDefined();
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Crear la clase" })
        .disabled,
    ).toBe(true);
  });

  it("keeps the name when going back and forth", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");
    fireEvent.click(
      screen.getByRole("button", { name: "Volver al nombre de la clase" }),
    );

    expect(
      screen.getByLabelText<HTMLInputElement>("¿Cómo se llama tu clase?").value,
    ).toBe("Los Caracoles");
  });

  it("resets the builder after each added child", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");
    addChild("Rana");

    expect(screen.getByLabelText<HTMLInputElement>("Apodo").value).toBe("");
    expect(screen.getByRole("button", { name: "Rana (en uso)" })).toBeDefined();
  });

  it("does not accept a whitespace-only classroom name", () => {
    render(<SetupWizard onCreate={() => {}} />);

    fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
      target: { value: "   " },
    });

    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Añadir peques →",
      }).disabled,
    ).toBe(true);
  });

  it("steps the course down and clamps at the previous course", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 30));
    render(<SetupWizard onCreate={() => {}} />);

    const previous = screen.getByRole<HTMLButtonElement>("button", {
      name: "Curso anterior",
    });
    fireEvent.click(previous);

    expect(screen.getByText("Curso 2025/2026")).toBeDefined();
    expect(previous.disabled).toBe(true);
    vi.useRealTimers();
  });

  it("edits a child from the roster", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");
    addChild("Rana");

    fireEvent.click(screen.getByRole("button", { name: "Rana, editar" }));
    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Ranita" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(
      screen.getByRole("button", { name: "Ranita, editar" }),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: "Rana, editar" })).toBeNull();
  });

  it("removes a child from the roster", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");
    addChild("Rana");

    fireEvent.click(screen.getByRole("button", { name: "Rana, editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));

    expect(screen.queryByRole("button", { name: "Rana, editar" })).toBeNull();
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Añadir libros →",
      }).disabled,
    ).toBe(true);
  });
});
