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

  // Which row an emoji lands on, and whether opening on a chosen one scrolls
  // the tray to it, are layout — jsdom has none, and setup.ts stubs
  // scrollIntoView to a no-op. Checked in a real browser instead.
  it("puts every emoji in one tray, with no panel to page through", () => {
    renderPicker();

    expect(screen.getByRole("radio", { name: "Rana" })).toBeDefined();
    expect(screen.getByRole("radio", { name: "Girasol" })).toBeDefined();
    expect(screen.getByRole("radio", { name: "Cohete" })).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
