import { fireEvent, render, screen } from "@testing-library/react";
import { TabBar } from "src/tab-bar.component";
import { describe, expect, it, vi } from "vitest";

describe("<TabBar />", () => {
  it("marks the active tab and only that one", () => {
    render(<TabBar active="clase" onSelect={() => {}} />);

    expect(
      screen
        .getByRole("button", { name: "Clase" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen
        .getByRole("button", { name: "Semana" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("reports the tapped tab", () => {
    const onSelect = vi.fn();
    render(<TabBar active="semana" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "Biblioteca" }));

    expect(onSelect).toHaveBeenCalledWith("biblioteca");
  });
});
