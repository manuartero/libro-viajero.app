import type { Tab } from "src/navigation/navigation.model";
import styles from "./tab-bar.module.css";

const TABS: { tab: Tab; label: string }[] = [
  { tab: "semana", label: "Semana" },
  { tab: "clase", label: "Clase" },
  { tab: "biblioteca", label: "Biblioteca" },
];

type TabBarProps = {
  active: Tab;
  onSelect: (tab: Tab) => void;
};

function currentTab(isActive: boolean) {
  if (isActive) {
    return "page";
  }
  return undefined;
}

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <nav className={styles.tabBar} aria-label="Secciones">
      <div className={styles.tabs}>
        {TABS.map(({ tab, label }) => (
          <button
            key={tab}
            type="button"
            className={styles.tab}
            aria-current={currentTab(tab === active)}
            onClick={() => onSelect(tab)}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
