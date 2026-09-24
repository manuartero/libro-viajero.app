import { fireEvent, render, screen } from "@testing-library/react";
import { Colophon } from "src/colophon/colophon.component";
import { describe, expect, it } from "vitest";
import { version } from "../../package.json";

// jsdom stubs <dialog>, so focus and Escape are checked in a real browser.
const openColophon = () => {
  fireEvent.click(
    screen.getByRole("button", { name: `libro-viajero · v${version}` }),
  );
};

describe("<Colophon />", () => {
  it("stays closed until the teacher asks", () => {
    render(<Colophon />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens from the version line and shows the same version", () => {
    render(<Colophon />);

    openColophon();

    const dialog = screen.getByRole("dialog", { name: "libro-viajero" });
    expect(dialog.textContent).toContain(`v${version}`);
  });

  it("closes with the button", () => {
    render(<Colophon />);

    openColophon();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
