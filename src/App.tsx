import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { ToC } from "./components/TOC";

function App() {
  return (
    <ErrorBoundary>
      <ToC />
    </ErrorBoundary>
  );
}

export default App;
