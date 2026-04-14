import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTOCSearch } from "./useTOCSearch";
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
  makeNode("a", "Getting Started", [
    makeNode("a1", "Installation"),
    makeNode("a2", "Configuration"),
  ]),
  makeNode("b", "Advanced Topics"),
  makeNode("c", "FAQ"),
];

describe("useTOCSearch", () => {
  it("should return the full tree when no query is applied", () => {
    const { result } = renderHook(() => useTOCSearch(tree));

    expect(result.current.filteredTree).toBe(tree);
    expect(result.current.count).toBe(0);
    expect(result.current.searchQuery).toBe("");
    expect(result.current.appliedQuery).toBe("");
  });

  it("should filter live on handleSearchChange", () => {
    const { result } = renderHook(() => useTOCSearch(tree));

    act(() => {
      result.current.handleSearchChange({
        target: { value: "install" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.searchQuery).toBe("install");
    expect(result.current.appliedQuery).toBe("install");
    expect(result.current.count).toBe(1);
    expect(result.current.filteredTree.length).toBeGreaterThan(0);
  });

  it("should trim the query when filtering live", () => {
    const { result } = renderHook(() => useTOCSearch(tree));

    act(() => {
      result.current.handleSearchChange({
        target: { value: "  FAQ  " },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.appliedQuery).toBe("FAQ");
    expect(result.current.count).toBe(1);
  });

  it("should clear search on handleClear", () => {
    const { result } = renderHook(() => useTOCSearch(tree));

    act(() => {
      result.current.handleSearchChange({
        target: { value: "FAQ" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.appliedQuery).toBe("FAQ");

    act(() => {
      result.current.handleClear();
    });

    expect(result.current.searchQuery).toBe("");
    expect(result.current.appliedQuery).toBe("");
    expect(result.current.filteredTree).toBe(tree);
  });

  it("should return zero count for no matches", () => {
    const { result } = renderHook(() => useTOCSearch(tree));

    act(() => {
      result.current.handleSearchChange({
        target: { value: "nonexistent" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.count).toBe(0);
    expect(result.current.filteredTree).toHaveLength(0);
  });

  it("should preserve ancestor nodes when child matches", () => {
    const { result } = renderHook(() => useTOCSearch(tree));

    act(() => {
      result.current.handleSearchChange({
        target: { value: "Installation" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.filteredTree).toHaveLength(1);
    expect(result.current.filteredTree[0].id).toBe("a");
    expect(result.current.filteredTree[0].children).toHaveLength(1);
    expect(result.current.filteredTree[0].children[0].id).toBe("a1");
  });

  it("should update filtered results when tree changes", () => {
    const { result, rerender } = renderHook(({ tree }) => useTOCSearch(tree), {
      initialProps: { tree },
    });

    act(() => {
      result.current.handleSearchChange({
        target: { value: "New" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.filteredTree).toHaveLength(0);

    const newTree = [...tree, makeNode("d", "New Feature")];
    rerender({ tree: newTree });

    expect(result.current.count).toBe(1);
  });

  it("should prevent default on form submit without filtering", () => {
    const { result } = renderHook(() => useTOCSearch(tree));
    const preventDefault = vi.fn();

    act(() => {
      result.current.handleSearchSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
  });
});
