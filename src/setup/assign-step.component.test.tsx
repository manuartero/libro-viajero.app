import { fireEvent, render, screen } from "@testing-library/react";
import { AssignStep } from "src/setup/assign-step.component";
import { describe, expect, it, vi } from "vitest";

const childList = [
  { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" },
  { id: "c2", tag: "Dino", emoji: "🦕", color: "#ffca3a" },
];

const bookList = [
  { id: "b1", title: "Elmer" },
  { id: "b2", title: "La oruga" },
];

const renderStep = ({
  pairs = {},
  onAssign = () => {},
  onUnassign = () => {},
  onCreate = () => {},
}: {
  pairs?: Record<string, string>;
  onAssign?: (input: { childId: string; bookId: string }) => void;
  onUnassign?: (childId: string) => void;
  onCreate?: () => void;
}) =>
  render(
    <AssignStep
      classroomName="Los Caracoles"
      yearShort="2026/27"
      childList={childList}
      bookList={bookList}
      pairs={pairs}
      onBack={() => {}}
      onAssign={onAssign}
      onUnassign={onUnassign}
      onCreate={onCreate}
    />,
  );

describe("<AssignStep />", () => {
  it("assigns a tapped book to the first child without one", () => {
    const onAssign = vi.fn();
    renderStep({ pairs: { c1: "b1" }, onAssign });

    fireEvent.click(screen.getByRole("button", { name: "La oruga, asignar" }));

    expect(onAssign).toHaveBeenCalledWith({ childId: "c2", bookId: "b2" });
  });

  it("re-targets the assignment by tapping a child first", () => {
    const onAssign = vi.fn();
    renderStep({ onAssign });

    fireEvent.click(screen.getByRole("button", { name: "Dino, sin libro" }));
    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));

    expect(onAssign).toHaveBeenCalledWith({ childId: "c2", bookId: "b1" });
  });

  it("returns a book to the tray on unassign", () => {
    const onUnassign = vi.fn();
    renderStep({ pairs: { c1: "b1" }, onUnassign });

    fireEvent.click(screen.getByRole("button", { name: "Rana, quitar libro" }));

    expect(onUnassign).toHaveBeenCalledWith("c1");
  });

  it("only enables creation when every child has a book", () => {
    const { unmount } = renderStep({ pairs: { c1: "b1" } });

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Crear la clase" })
        .disabled,
    ).toBe(true);
    unmount();

    const onCreate = vi.fn();
    renderStep({ pairs: { c1: "b1", c2: "b2" }, onCreate });

    const create = screen.getByRole<HTMLButtonElement>("button", {
      name: "Crear la clase",
    });
    expect(create.disabled).toBe(false);
    fireEvent.click(create);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
