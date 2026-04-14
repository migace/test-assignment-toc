import { lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import Loader from "./components/Loader/Loader";

const ToC = lazy(() =>
  import("./components/TOC").then((m) => ({ default: m.ToC }))
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <ToC />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
