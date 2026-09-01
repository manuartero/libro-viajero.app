import { fireEvent, render, screen } from "@testing-library/react";
import { CreateClass } from "src/setup/create-class.component";
import { describe, expect, it, vi } from "vitest";

describe("<CreateClass />", () => {
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

  it("steps the course year within one year of the current one", () => {
    const onCreate = vi.fn();
    render(<CreateClass onCreate={onCreate} />);

    const next = screen.getByRole("button", { name: "Curso siguiente" });
    fireEvent.click(next);
    expect(next.hasAttribute("disabled")).toBe(true);

    fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
      target: { value: "Los Caracoles" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));

    const yearShort = onCreate.mock.calls[0][0].name.split(" ").at(-1);
    const currentStart =
      new Date().getMonth() >= 6
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;
    expect(yearShort.startsWith(String(currentStart + 1))).toBe(true);
  });
});
