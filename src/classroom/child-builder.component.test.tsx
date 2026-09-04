import { fireEvent, render, screen } from "@testing-library/react";
import { ChildBuilder } from "src/classroom/child-builder.component";
import { describe, expect, it, vi } from "vitest";

const noHandlers = {
  onAdd: () => {},
  onSave: () => {},
  onRemove: () => {},
  onCancel: () => {},
};

const changeNickname = () => {
  fireEvent.click(screen.getByRole("button", { name: "Cambiar apodo" }));
};

describe("<ChildBuilder />", () => {
  it("names the child after the emoji without asking for a nickname", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Dino" }));

    expect(screen.getByText("Dino")).toBeDefined();
    expect(screen.queryByLabelText("Apodo")).toBeNull();
  });

  it("reveals and focuses the nickname field only on purpose", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Rana" }));
    changeNickname();

    const input = screen.getByLabelText<HTMLInputElement>("Apodo");
    expect(input.value).toBe("Rana");
    expect(document.activeElement).toBe(input);
    expect(screen.getByText(/Nada de nombres reales/)).toBeDefined();
  });

  it("does not pull focus back into the nickname field on later taps", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Rana" }));
    changeNickname();
    const dino = screen.getByRole("radio", { name: "Dino" });
    dino.focus();
    fireEvent.click(dino);

    expect(document.activeElement).toBe(dino);
  });

  it("offers to change the nickname only once there is an emoji", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    expect(screen.queryByRole("button", { name: "Cambiar apodo" })).toBeNull();
    expect(screen.getByText("Toca un emoji")).toBeDefined();
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

    fireEvent.click(screen.getByRole("radio", { name: "Rana" }));
    changeNickname();
    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Capitana" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Dino" }));

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

    fireEvent.click(screen.getByRole("radio", { name: "Dino" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Añadir peque a la clase" }),
    );

    expect(onAdd).toHaveBeenCalledWith({
      tag: "Dino",
      emoji: "🦕",
      color: "#f3722c",
    });
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

    fireEvent.click(screen.getByRole("radio", { name: "Rana" }));
    changeNickname();
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

  it("disables adding until there is an emoji", () => {
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

    fireEvent.click(screen.getByRole("radio", { name: "Rana" }));
    expect(add.disabled).toBe(false);
  });

  it("disables adding when the teacher empties the nickname", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={null}
        {...noHandlers}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Rana" }));
    changeNickname();
    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "   " },
    });

    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Añadir peque a la clase",
      }).disabled,
    ).toBe(true);
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

    expect(screen.getByRole("radio", { name: "Rana (en uso)" })).toBeDefined();
  });

  it("hands the edited child's emoji to the picker as the selected one", () => {
    render(
      <ChildBuilder
        usedEmojis={[]}
        usedColors={[]}
        editing={{ id: "c1", tag: "Girasol", emoji: "🌻", color: "#8ac926" }}
        {...noHandlers}
      />,
    );

    expect(
      screen.getByRole("radio", { name: "Girasol", checked: true }),
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

    expect(screen.getByText("Rana")).toBeDefined();
    changeNickname();
    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Ranita" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSave).toHaveBeenCalledWith({ ...editing, tag: "Ranita" });

    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));
    expect(onRemove).toHaveBeenCalledWith("c1");
  });
});
