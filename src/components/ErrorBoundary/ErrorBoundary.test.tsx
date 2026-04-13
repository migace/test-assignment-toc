import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "./ErrorBoundary";

const ThrowingComponent = ({ error }: { error?: Error }) => {
  if (error) throw error;
  return <div>Working content</div>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Child content")).toBeDefined();
  });

  it("should render error UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Test error")} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("Test error")).toBeDefined();
    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("should render default message when error has no message", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error()} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it("should render custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent error={new Error("Test error")} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom fallback")).toBeDefined();
    expect(screen.queryByText("Something went wrong")).toBeNull();
  });

  it("should show Try again button", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Test error")} />
      </ErrorBoundary>
    );

    expect(screen.getByRole("button", { name: "Try again" })).toBeDefined();
  });

  it("should reset error state when Try again is clicked", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Test error")} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();

    // Re-render with non-throwing component before clicking reset
    rerender(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Working content")).toBeDefined();
    expect(screen.queryByText("Something went wrong")).toBeNull();
  });

  it("should log error to console", () => {
    const consoleSpy = vi.spyOn(console, "error");

    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Logged error")} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();
  });
});
