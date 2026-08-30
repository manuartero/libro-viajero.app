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

describe("<SetupWizard />", () => {
  it("cannot leave the name step without a classroom name", () => {
    render(<SetupWizard onCreate={() => {}} />);

    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Añadir peques →",
      }).disabled,
    ).toBe(true);
  });

  it("cannot create a classroom without children", () => {
    render(<SetupWizard onCreate={() => {}} />);

    nameTheClass("Los Caracoles");

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Crear la clase" })
        .disabled,
    ).toBe(true);
  });

  it("creates the project with the school year appended to the name", () => {
    const onCreate = vi.fn();
    render(<SetupWizard onCreate={onCreate} />);

    nameTheClass("Los Caracoles");
    addChild("Rana");
    addChild("Dino");
    fireEvent.click(
      screen.getByRole("button", { name: "Crear la clase (2 peques)" }),
    );

    expect(onCreate).toHaveBeenCalledTimes(1);
    const project = onCreate.mock.calls[0][0];
    expect(project.name).toMatch(/^Los Caracoles \d{4}\/\d{2}$/);
    expect(project.children.map((c: { tag: string }) => c.tag)).toEqual([
      "Rana",
      "Dino",
    ]);
    expect(project.books).toEqual([]);
    expect(project.currentAssignments).toEqual([]);
    expect(project.history).toEqual([]);
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
});
