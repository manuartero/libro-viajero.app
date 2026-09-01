import type { AppTab } from "src/app.model";
import styles from "./tab-bar.module.css";

const TABS: { tab: AppTab; label: string }[] = [
  { tab: "semana", label: "Semana" },
  { tab: "clase", label: "Clase" },
  { tab: "biblioteca", label: "Biblioteca" },
];

type TabBarProps = {
  active: AppTab;
  onSelect: (tab: AppTab) => void;
};

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <nav className={styles.tabBar} aria-label="Secciones">
      <div className={styles.tabs}>
        {TABS.map(({ tab, label }) => (
          <button
            key={tab}
            type="button"
            className={styles.tab}
            aria-current={tab === active ? "page" : undefined}
            onClick={() => onSelect(tab)}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
