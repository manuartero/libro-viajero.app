import type { ReactNode } from "react";
import styles from "./primary-button.module.css";

type PrimaryButtonProps = {
  children: ReactNode;
  tone?: "ink" | "go";
  size?: "large" | "medium";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

// The full-width CTA used across wizard steps, dashboard, and error fallback.
export function PrimaryButton({
  children,
  tone = "ink",
  size = "large",
  type = "button",
  disabled = false,
  onClick,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[tone]} ${styles[size]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
