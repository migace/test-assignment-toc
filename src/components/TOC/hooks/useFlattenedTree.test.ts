import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFlattenedTree } from "./useFlattenedTree";
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
  makeNode("a", "Node A", [
    makeNode("a1", "Node A1", [makeNode("a1a", "Node A1A")]),
    makeNode("a2", "Node A2"),
  ]),
  makeNode("b", "Node B"),
];

describe("useFlattenedTree", () => {
  it("should flatten only root nodes when nothing is expanded", () => {
    const { result } = renderHook(() =>
      useFlattenedTree(tree, new Set<string>())
    );

    expect(result.current).toHaveLength(2);
    expect(result.current[0].node.id).toBe("a");
    expect(result.current[1].node.id).toBe("b");
  });

  it("should include children of expanded nodes", () => {
    const { result } = renderHook(() => useFlattenedTree(tree, new Set(["a"])));

    expect(result.current).toHaveLength(4);
    expect(result.current.map((fn) => fn.node.id)).toEqual([
      "a",
      "a1",
      "a2",
      "b",
    ]);
  });

  it("should include deeply nested children when ancestors are expanded", () => {
    const { result } = renderHook(() =>
      useFlattenedTree(tree, new Set(["a", "a1"]))
    );

    expect(result.current).toHaveLength(5);
    expect(result.current.map((fn) => fn.node.id)).toEqual([
      "a",
      "a1",
      "a1a",
      "a2",
      "b",
    ]);
  });

  it("should set correct depth values", () => {
    const { result } = renderHook(() =>
      useFlattenedTree(tree, new Set(["a", "a1"]))
    );

    expect(result.current.map((fn) => fn.depth)).toEqual([0, 1, 2, 1, 0]);
  });

  it("should set correct parentId", () => {
    const { result } = renderHook(() =>
      useFlattenedTree(tree, new Set(["a", "a1"]))
    );

    expect(result.current[0].parentId).toBeNull(); // a
    expect(result.current[1].parentId).toBe("a"); // a1
    expect(result.current[2].parentId).toBe("a1"); // a1a
    expect(result.current[3].parentId).toBe("a"); // a2
    expect(result.current[4].parentId).toBeNull(); // b
  });

  it("should set correct hasChildren flag", () => {
    const { result } = renderHook(() => useFlattenedTree(tree, new Set(["a"])));

    expect(result.current[0].hasChildren).toBe(true); // a
    expect(result.current[1].hasChildren).toBe(true); // a1
    expect(result.current[2].hasChildren).toBe(false); // a2
    expect(result.current[3].hasChildren).toBe(false); // b
  });

  it("should set correct isExpanded flag", () => {
    const { result } = renderHook(() => useFlattenedTree(tree, new Set(["a"])));

    expect(result.current[0].isExpanded).toBe(true); // a is expanded
    expect(result.current[1].isExpanded).toBe(false); // a1 is not expanded
    expect(result.current[3].isExpanded).toBe(false); // b is not expanded
  });

  it("should set correct setSize and posInSet", () => {
    const { result } = renderHook(() => useFlattenedTree(tree, new Set(["a"])));

    // Root level has 2 siblings
    expect(result.current[0].setSize).toBe(2); // a
    expect(result.current[0].posInSet).toBe(1);
    expect(result.current[3].setSize).toBe(2); // b
    expect(result.current[3].posInSet).toBe(2);

    // a's children have 2 siblings
    expect(result.current[1].setSize).toBe(2); // a1
    expect(result.current[1].posInSet).toBe(1);
    expect(result.current[2].setSize).toBe(2); // a2
    expect(result.current[2].posInSet).toBe(2);
  });

  it("should handle empty tree", () => {
    const { result } = renderHook(() =>
      useFlattenedTree([], new Set<string>())
    );

    expect(result.current).toHaveLength(0);
  });

  it("should handle single node tree", () => {
    const single = [makeNode("only", "Only Node")];
    const { result } = renderHook(() =>
      useFlattenedTree(single, new Set<string>())
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].setSize).toBe(1);
    expect(result.current[0].posInSet).toBe(1);
    expect(result.current[0].parentId).toBeNull();
  });

  it("should memoize result when inputs are the same", () => {
    const expandedIds = new Set<string>();
    const { result, rerender } = renderHook(() =>
      useFlattenedTree(tree, expandedIds)
    );

    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
