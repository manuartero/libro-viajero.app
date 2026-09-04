import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// jsdom 29 ships HTMLDialogElement as an empty stub: its prototype carries
// only `open`, with no showModal/close and no cancel-on-Escape. These two
// methods are the minimum that lets a <dialog> render and close under test.
// They assert nothing themselves — the behaviour the platform owns (initial
// focus, focus restoration, background inertness, Escape) cannot be faked
// here and is checked in a real browser instead.
if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

// jsdom implements no layout, so Element.scrollIntoView does not exist and
// calling it throws. The classroom builder calls it on open; a no-op is enough
// to let the component render. Where it actually scrolls to is, like the
// dialog behaviour above, a real-browser check.
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}
