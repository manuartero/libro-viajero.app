import { fireEvent, render, screen } from "@testing-library/react";
import { EmojiPicker } from "src/classroom/emoji-picker.component";
import { describe, expect, it, vi } from "vitest";

// Arrow-key navigation and the single tab stop are the browser's, because
// these are real <input type="radio"> in a real fieldset — there is no
// roving-tabindex code here to test, and asserting jsdom's radio handling
// would be testing the platform.
const renderPicker = (props?: Partial<Parameters<typeof EmojiPicker>[0]>) => {
  const onPick = vi.fn();
  render(
    <EmojiPicker
      selectedEmoji={null}
      usedEmojis={[]}
      onPick={onPick}
      {...props}
    />,
  );
  return onPick;
};

describe("<EmojiPicker />", () => {
  it("names each option in Spanish rather than by its emoji", () => {
    renderPicker();

    expect(screen.getByRole("radio", { name: "Rana" })).toBeDefined();
    expect(screen.getByRole("radio", { name: "Zorro" })).toBeDefined();
  });

  it("marks the chosen emoji as checked", () => {
    renderPicker({ selectedEmoji: "🦊" });

    expect(
      screen.getByRole("radio", { name: "Zorro", checked: true }),
    ).toBeDefined();
    expect(
      screen.getByRole("radio", { name: "Rana", checked: false }),
    ).toBeDefined();
  });

  it("groups the options so exactly one can be chosen", () => {
    renderPicker();

    const names = screen
      .getAllByRole("radio")
      .map((radio) => radio.getAttribute("name"));

    expect(new Set(names).size).toBe(1);
  });

  it("says which emojis another child already took", () => {
    renderPicker({ usedEmojis: ["🐸"] });

    expect(screen.getByRole("radio", { name: "Rana (en uso)" })).toBeDefined();
  });

  it("hands the whole catalog entry over, so the nickname can follow", () => {
    const onPick = renderPicker();

    fireEvent.click(screen.getByRole("radio", { name: "Zorro" }));

    expect(onPick).toHaveBeenCalledWith({ emoji: "🦊", name: "Zorro" });
  });

  it("opens on the panel holding the chosen emoji", () => {
    renderPicker({ selectedEmoji: "🌻" });

    expect(
      screen.getByRole("radio", { name: "Girasol", checked: true }),
    ).toBeDefined();
    expect(screen.queryByRole("radio", { name: "Rana" })).toBeNull();
  });

  it("cycles panels with the next arrow and wraps around", () => {
    renderPicker();

    expect(screen.queryByRole("radio", { name: "Girasol" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Más emojis" }));
    expect(screen.getByRole("radio", { name: "Girasol" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Más emojis" }));
    fireEvent.click(screen.getByRole("button", { name: "Más emojis" }));
    expect(screen.getByRole("radio", { name: "Rana" })).toBeDefined();
  });
});
