import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExpandedState } from "./useExpandedState";
import type { TOCNode } from "../types";

const makeNode = (
  id: string,
  title: string,
  children: TOCNode[] = []
): TOCNode => ({
  id,
  title,
  url: `${id}.html`,
  level: 0,
  children,
  anchors: [],
});

const tree: TOCNode[] = [
  makeNode("root1", "Root 1", [
    makeNode("child1", "Child 1", [makeNode("grandchild1", "Grandchild 1")]),
    makeNode("child2", "Child 2"),
  ]),
  makeNode("root2", "Root 2"),
];

describe("useExpandedState", () => {
  it("should start with no expanded ids", () => {
    const { result } = renderHook(() => useExpandedState(null, tree));

    expect(result.current.expandedIds.size).toBe(0);
  });

  it("should toggle a node", () => {
    const { result } = renderHook(() => useExpandedState(null, tree));

    act(() => {
      result.current.toggle("root1");
    });

    expect(result.current.expandedIds.has("root1")).toBe(true);

    act(() => {
      result.current.toggle("root1");
    });

    expect(result.current.expandedIds.has("root1")).toBe(false);
  });

  it("should expand a node", () => {
    const { result } = renderHook(() => useExpandedState(null, tree));

    act(() => {
      result.current.expand("root1");
    });

    expect(result.current.expandedIds.has("root1")).toBe(true);

    // Expanding again should be a no-op (same reference)
    const prev = result.current.expandedIds;
    act(() => {
      result.current.expand("root1");
    });

    expect(result.current.expandedIds).toBe(prev);
  });

  it("should collapse a node", () => {
    const { result } = renderHook(() => useExpandedState(null, tree));

    act(() => {
      result.current.expand("root1");
    });

    expect(result.current.expandedIds.has("root1")).toBe(true);

    act(() => {
      result.current.collapse("root1");
    });

    expect(result.current.expandedIds.has("root1")).toBe(false);

    // Collapsing again should be a no-op (same reference)
    const prev = result.current.expandedIds;
    act(() => {
      result.current.collapse("root1");
    });

    expect(result.current.expandedIds).toBe(prev);
  });

  it("should auto-expand ancestors when activeId is set to a deep node", () => {
    const { result } = renderHook(() => useExpandedState("grandchild1", tree));

    expect(result.current.expandedIds.has("root1")).toBe(true);
    expect(result.current.expandedIds.has("child1")).toBe(true);
  });

  it("should not expand anything when activeId is a root node", () => {
    const { result } = renderHook(() => useExpandedState("root1", tree));

    expect(result.current.expandedIds.size).toBe(0);
  });

  it("should update ancestors when activeId changes", () => {
    const { result, rerender } = renderHook(
      ({ activeId }) => useExpandedState(activeId, tree),
      { initialProps: { activeId: null as string | null } }
    );

    expect(result.current.expandedIds.size).toBe(0);

    rerender({ activeId: "grandchild1" });

    expect(result.current.expandedIds.has("root1")).toBe(true);
    expect(result.current.expandedIds.has("child1")).toBe(true);
  });

  it("should handle multiple toggles independently", () => {
    const { result } = renderHook(() => useExpandedState(null, tree));

    act(() => {
      result.current.toggle("root1");
    });

    act(() => {
      result.current.toggle("root2");
    });

    expect(result.current.expandedIds.has("root1")).toBe(true);
    expect(result.current.expandedIds.has("root2")).toBe(true);

    act(() => {
      result.current.toggle("root1");
    });

    expect(result.current.expandedIds.has("root1")).toBe(false);
    expect(result.current.expandedIds.has("root2")).toBe(true);
  });

  it("should not change state when activeId is not found in tree", () => {
    const { result } = renderHook(() => useExpandedState("nonexistent", tree));

    expect(result.current.expandedIds.size).toBe(0);
  });
});
