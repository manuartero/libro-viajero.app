import { Component, type ReactNode } from "react";
import styles from "./app-error-boundary.module.css";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

// React error boundaries can only be class components — the one place the
// project's "no class" rule yields to the framework.
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("libro-viajero: unhandled render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className={styles.fallback}>
          <h1 className={styles.title}>Algo ha fallado</h1>
          <p className={styles.hint}>
            Recarga la página para volver a intentarlo.
          </p>
          <button
            type="button"
            className={styles.reload}
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
