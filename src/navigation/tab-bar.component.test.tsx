import { fireEvent, render, screen } from "@testing-library/react";
import { TabBar } from "src/navigation/tab-bar.component";
import { describe, expect, it, vi } from "vitest";

describe("<TabBar />", () => {
  it("exposes the three sections and marks the active one", () => {
    render(<TabBar active="clase" onSelect={() => {}} />);

    const nav = screen.getByRole("navigation", { name: "Secciones" });
    expect(nav).toBeDefined();
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
