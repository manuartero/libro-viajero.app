import { Dashboard } from "src/dashboard/dashboard.component";
import { mockProject } from "src/data/mock-project.fixture";

export function App() {
  return <Dashboard project={mockProject} />;
}
