import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MissingSummary } from "src/dashboard/missing-summary.component";
import type { MissingBook } from "src/project/project.model";
import { afterEach, describe, expect, it, vi } from "vitest";

const rana: MissingBook = {
  child: { id: "c1", tag: "Rana", emoji: "🐸", color: "#ff595e" },
  book: { id: "b1", title: "Elmer" },
};

const zorro: MissingBook = {
  child: { id: "c2", tag: "Zorro", emoji: "🦊", color: "#1982c4" },
  book: { id: "b2", title: "El Grúfalo" },
};

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  const spy = vi.fn(writeText);
  vi.stubGlobal("navigator", { clipboard: { writeText: spy } });
  return spy;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("<MissingSummary />", () => {
  it("celebrates when nothing is missing", () => {
    render(<MissingSummary missing={[]} />);

    expect(screen.getByText("¡Todos los libros han vuelto! 🎉")).toBeDefined();
  });

  it("names whose reminder each button copies", () => {
    render(<MissingSummary missing={[rana, zorro]} />);

    expect(
      screen.getByRole("button", { name: "Copiar aviso de Rana" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Copiar aviso de Zorro" }),
    ).toBeDefined();
  });

  it("copies a reminder naming the child and the book", async () => {
    const writeText = stubClipboard(() => Promise.resolve());
    render(<MissingSummary missing={[rana]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Copiar aviso de Rana" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copiado, aviso de Rana" }),
      ).toBeDefined();
    });
    expect(writeText.mock.calls[0][0]).toContain("«Elmer»");
    expect(writeText.mock.calls[0][0]).toContain("Rana");
  });

  it("says so on the button when the clipboard refuses", async () => {
    stubClipboard(() => Promise.reject(new Error("denied")));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<MissingSummary missing={[rana]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Copiar aviso de Rana" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "No se pudo copiar el aviso de Rana",
        }),
      ).toBeDefined();
    });
  });

  it("reports the outcome only on the row that was copied", async () => {
    stubClipboard(() => Promise.resolve());
    render(<MissingSummary missing={[rana, zorro]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Copiar aviso de Rana" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copiado, aviso de Rana" }),
      ).toBeDefined();
    });
    expect(
      screen.getByRole("button", { name: "Copiar aviso de Zorro" }),
    ).toBeDefined();
  });

  it("falls back to «su libro» when the book is gone", async () => {
    const writeText = stubClipboard(() => Promise.resolve());
    render(<MissingSummary missing={[{ ...rana, book: undefined }]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Copiar aviso de Rana" }),
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledOnce();
    });
    expect(writeText.mock.calls[0][0]).toContain("«su libro»");
  });
});
