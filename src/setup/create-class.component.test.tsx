import { fireEvent, render, screen } from "@testing-library/react";
import { CreateClass } from "src/setup/create-class.component";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<CreateClass />", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("disables creation until the class has a name", () => {
    render(<CreateClass onCreate={() => {}} />);

    const create = screen.getByRole("button", { name: "Crear la clase" });
    expect(create.hasAttribute("disabled")).toBe(true);

    fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
      target: { value: "Los Caracoles" },
    });

    expect(create.hasAttribute("disabled")).toBe(false);
  });

  it("creates an empty project named after the class and course", () => {
    const onCreate = vi.fn();
    render(<CreateClass onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
      target: { value: "  Los Caracoles  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    const project = onCreate.mock.calls[0][0];
    expect(project.name).toMatch(/^Los Caracoles \d{4}\/\d{2}$/);
    expect(project.id).toBeTruthy();
    expect(project.children).toEqual([]);
    expect(project.books).toEqual([]);
    expect(project.currentAssignments).toEqual([]);
    expect(project.history).toEqual([]);
  });

  it("stamps the class with the running course, without asking", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T10:00:00"));
    const onCreate = vi.fn();
    render(<CreateClass onCreate={onCreate} />);

    expect(screen.getByText("Curso 2026/2027")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
      target: { value: "Los Caracoles" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));

    expect(onCreate.mock.calls[0][0].name).toBe("Los Caracoles 2026/27");
  });
});
