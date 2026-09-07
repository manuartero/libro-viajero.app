import { fireEvent, render, screen } from "@testing-library/react";
import { CreateClassroom } from "src/project/create-classroom.component";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<CreateClassroom />", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("disables creation until the class has a name", () => {
    render(<CreateClassroom onCreate={() => {}} />);

    const create = screen.getByRole("button", { name: "Crear la clase" });
    expect(create.hasAttribute("disabled")).toBe(true);

    fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
      target: { value: "Los Caracoles" },
    });

    expect(create.hasAttribute("disabled")).toBe(false);
  });

  it("stamps the class with the running course, without asking", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T10:00:00"));
    const onCreate = vi.fn();
    render(<CreateClassroom onCreate={onCreate} />);

    expect(screen.getByText("Curso 2026/2027")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
      target: { value: "Los Caracoles" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));

    expect(onCreate.mock.calls[0][0].name).toBe("Los Caracoles 2026/27");
  });
});
