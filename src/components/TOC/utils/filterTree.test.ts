import { describe, it, expect } from "vitest";
import { filterTree } from "./filterTree";
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

describe("filterTree", () => {
  const tree: TOCNode[] = [
    makeNode("getting-started", "Getting Started", [
      makeNode("installation", "Installation"),
      makeNode("configuration", "Configuration"),
    ]),
    makeNode("advanced", "Advanced Topics", [
      makeNode("plugins", "Plugins"),
      makeNode("api", "API Reference"),
    ]),
    makeNode("faq", "FAQ"),
  ];

  it("should return original tree and count 0 for empty query", () => {
    const result = filterTree({ nodes: tree, query: "" });

    expect(result.tree).toBe(tree);
    expect(result.count).toBe(0);
  });

  it("should return original tree for whitespace-only query", () => {
    const result = filterTree({ nodes: tree, query: "   " });

    expect(result.tree).toBe(tree);
    expect(result.count).toBe(0);
  });

  it("should find leaf nodes by title", () => {
    const result = filterTree({ nodes: tree, query: "installation" });

    expect(result.count).toBe(1);
    expect(result.tree).toHaveLength(1);
    expect(result.tree[0].id).toBe("getting-started");
    expect(result.tree[0].children).toHaveLength(1);
    expect(result.tree[0].children[0].id).toBe("installation");
  });

  it("should find parent nodes by title", () => {
    const result = filterTree({ nodes: tree, query: "advanced" });

    expect(result.count).toBe(1);
    expect(result.tree).toHaveLength(1);
    expect(result.tree[0].id).toBe("advanced");
  });

  it("should preserve ancestor path to matching node", () => {
    const result = filterTree({ nodes: tree, query: "api" });

    expect(result.tree).toHaveLength(1);
    expect(result.tree[0].id).toBe("advanced");
    expect(result.tree[0].children).toHaveLength(1);
    expect(result.tree[0].children[0].id).toBe("api");
  });

  it("should match case-insensitively", () => {
    const result = filterTree({ nodes: tree, query: "FAQ" });

    expect(result.count).toBe(1);
    expect(result.tree[0].id).toBe("faq");
  });

  it("should handle diacritics via normalize", () => {
    const treeWithDiacritics: TOCNode[] = [makeNode("cafe", "Café Guide")];

    const result = filterTree({ nodes: treeWithDiacritics, query: "cafe" });

    expect(result.count).toBe(1);
  });

  it("should return empty tree when no matches", () => {
    const result = filterTree({ nodes: tree, query: "nonexistent" });

    expect(result.tree).toHaveLength(0);
    expect(result.count).toBe(0);
  });

  it("should handle empty tree", () => {
    const result = filterTree({ nodes: [], query: "test" });

    expect(result.tree).toHaveLength(0);
    expect(result.count).toBe(0);
  });

  it("should count only direct matches, not ancestors kept for context", () => {
    const result = filterTree({ nodes: tree, query: "plugin" });

    expect(result.count).toBe(1);
    // Parent "Advanced Topics" is kept but not counted
    expect(result.tree).toHaveLength(1);
    expect(result.tree[0].id).toBe("advanced");
  });

  it("should find multiple matches across branches", () => {
    const result = filterTree({ nodes: tree, query: "tion" });

    // "Installation" and "Configuration" both match
    expect(result.count).toBe(2);
    expect(result.tree).toHaveLength(1);
    expect(result.tree[0].children).toHaveLength(2);
  });

  it("should match partial strings", () => {
    const result = filterTree({ nodes: tree, query: "start" });

    expect(result.count).toBe(1);
    expect(result.tree[0].id).toBe("getting-started");
  });

  it("should handle deeply nested trees", () => {
    const deep: TOCNode[] = [
      makeNode("l1", "Level 1", [
        makeNode("l2", "Level 2", [
          makeNode("l3", "Level 3", [makeNode("target", "Deep Target")]),
        ]),
      ]),
    ];

    const result = filterTree({ nodes: deep, query: "target" });

    expect(result.count).toBe(1);
    expect(result.tree).toHaveLength(1);
    expect(result.tree[0].children[0].children[0].children[0].id).toBe(
      "target"
    );
  });
});
