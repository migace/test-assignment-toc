import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HighlightMatch } from "./HighlightMatch";

describe("HighlightMatch", () => {
  it("should render plain text when query is empty", () => {
    render(<HighlightMatch text="Hello world" query="" />);

    expect(screen.getByText("Hello world")).toBeDefined();
    expect(screen.queryByRole("mark")).toBeNull();
  });

  it("should highlight matching text", () => {
    render(<HighlightMatch text="Getting Started" query="Start" />);

    expect(screen.getByText("Start").tagName).toBe("MARK");
  });

  it("should be case-insensitive", () => {
    render(<HighlightMatch text="Getting Started" query="getting" />);

    expect(screen.getByText("Getting").tagName).toBe("MARK");
  });

  it("should render non-matching parts as plain text", () => {
    const { container } = render(
      <HighlightMatch text="Hello World" query="World" />
    );

    expect(container.textContent).toBe("Hello World");
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe("World");
  });

  it("should handle special regex characters in query", () => {
    render(<HighlightMatch text="price is $10.00" query="$10.00" />);

    expect(screen.getByText("$10.00").tagName).toBe("MARK");
  });

  it("should highlight multiple occurrences", () => {
    const { container } = render(
      <HighlightMatch text="test this test" query="test" />
    );

    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(2);
  });
});
