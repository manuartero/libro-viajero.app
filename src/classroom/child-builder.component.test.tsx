import { fireEvent, render, screen } from "@testing-library/react";
import { ChildBuilder } from "src/classroom/child-builder.component";
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
        usedColors={["#ff595e"]}
        editing={null}
        {...noHandlers}
        onAdd={onAdd}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dino" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Añadir peque a la clase" }),
    );

    expect(onAdd).toHaveBeenCalledWith({
      tag: "Dino",
      emoji: "🦕",
      color: "#f3722c",
    });
  });

  it("cycles emoji panels with the next arrow and wraps around", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    expect(screen.getByText("Animales")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Girasol" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Más emojis" }));
    expect(screen.getByText("Naturaleza")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Girasol" }));
    expect(screen.getByLabelText<HTMLInputElement>("Apodo").value).toBe(
      "Girasol",
    );

    fireEvent.click(screen.getByRole("button", { name: "Más emojis" }));
    expect(screen.getByText("Objetos")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Más emojis" }));
    expect(screen.getByText("Animales")).toBeDefined();
  });

  it("truncates the nickname to 20 characters on submit", () => {
    const onAdd = vi.fn();
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
        onAdd={onAdd}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rana" }));
    // maxLength on the input is advisory — a programmatic/paste value can
    // exceed it, so the boundary enforcement is at submit.
    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "a".repeat(25) },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Añadir peque a la clase" }),
    );

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ tag: "a".repeat(20) }),
    );
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
      name: "Añadir peque a la clase",
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

  it("opens on the panel of the edited child's emoji, shown as selected", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={{ id: "c1", tag: "Girasol", emoji: "🌻", color: "#8ac926" }}
        {...noHandlers}
      />,
    );

    expect(screen.getByText("Naturaleza")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Girasol", pressed: true }),
    ).toBeDefined();
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
