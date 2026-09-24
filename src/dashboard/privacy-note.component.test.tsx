import { fireEvent, render, screen } from "@testing-library/react";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { describe, expect, it, vi } from "vitest";

// Opening, closing and the focus contract (trap, Escape, return to trigger)
// are the platform's and jsdom stubs <dialog>, so they are checked in a real
// browser, not here.
describe("<PrivacyNote />", () => {
  it("hands the download over to the caller", () => {
    const onDownloadData = vi.fn();
    render(
      <PrivacyNote
        projectName="Los Caracoles 2026/27"
        onDownloadData={onDownloadData}
        onRestoreData={() => true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Tus datos" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Descargar una copia" }),
    );

    expect(onDownloadData).toHaveBeenCalledTimes(1);
  });
});
