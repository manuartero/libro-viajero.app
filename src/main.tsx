import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "src/app.component";
import { AppErrorBoundary } from "src/app-error-boundary.component";
import "@fontsource/besley/700.css";
import "src/styles/globals.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing #root element");
}

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
