import { fireEvent, render, screen } from "@testing-library/react";
import { ChildBuilder } from "src/setup/child-builder.component";
import { describe, expect, it, vi } from "vitest";

const noHandlers = {
  onAdd: () => {},
  onSave: () => {},
  onRemove: () => {},
  onCancel: () => {},
};

describe("<ChildBuilder />", () => {
  it("suggests the emoji's name as the nickname", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dino" }));

    expect(screen.getByLabelText<HTMLInputElement>("Apodo").value).toBe("Dino");
  });

  it("does not overwrite a nickname the teacher already typed", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Capitana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rana" }));

    expect(screen.getByLabelText<HTMLInputElement>("Apodo").value).toBe(
      "Capitana",
    );
  });

  it("adds the child with the tapped emoji and the preselected unused color", () => {
    const onAdd = vi.fn();
    render(
      <ChildBuilder
        usedEmojis={["🐸"]}
        usedColors={["#8ac926"]}
        editing={null}
        {...noHandlers}
        onAdd={onAdd}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dino" }));
    fireEvent.click(screen.getByRole("button", { name: "Añadir a la clase" }));

    expect(onAdd).toHaveBeenCalledWith({
      tag: "Dino",
      emoji: "🦕",
      color: "#ffca3a",
    });
  });

  it("caps the nickname at 20 characters", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    expect(screen.getByLabelText<HTMLInputElement>("Apodo").maxLength).toBe(20);
  });

  it("disables adding until there is an emoji and a nickname", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    const add = screen.getByRole<HTMLButtonElement>("button", {
      name: "Añadir a la clase",
    });
    expect(add.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Rana" }));
    expect(add.disabled).toBe(false);
  });

  it("marks emojis already in use", () => {
    render(
      <ChildBuilder
        usedEmojis={["🐸"]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    expect(screen.getByRole("button", { name: "Rana (en uso)" })).toBeDefined();
  });

  it("saves edits and offers removal when editing an existing child", () => {
    const onSave = vi.fn();
    const onRemove = vi.fn();
    const editing = { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" };
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={editing}
        {...noHandlers}
        onSave={onSave}
        onRemove={onRemove}
      />,
    );

    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Ranita" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSave).toHaveBeenCalledWith({ ...editing, tag: "Ranita" });

    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));
    expect(onRemove).toHaveBeenCalledWith("c1");
  });
});
