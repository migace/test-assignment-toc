import { describe, it, expect } from "vitest";
import { buildTree } from "./buildTree";
import { type TOCData } from "../components/TOC/types";
import helpTOCData from "../mocks/HelpTOC.json";

describe("buildTree", () => {
  it("should build a simple tree with one root node", () => {
    const mockData: TOCData = {
      entities: {
        pages: {
          root: {
            id: "root",
            title: "Root Page",
            url: "root.html",
            level: 0,
            pages: [],
          },
        },
        anchors: {},
      },
      topLevelIds: ["root"],
    };

    const result = buildTree(mockData);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "root",
      title: "Root Page",
      url: "root.html",
      level: 0,
      pages: [],
      children: [],
      anchors: [],
    });
  });

  it("should build a tree with nested pages", () => {
    const mockData: TOCData = {
      entities: {
        pages: {
          parent: {
            id: "parent",
            title: "Parent Page",
            url: "parent.html",
            level: 0,
            pages: ["child1", "child2"],
          },
          child1: {
            id: "child1",
            title: "Child 1",
            url: "child1.html",
            level: 1,
            pages: [],
            parentId: "parent",
          },
          child2: {
            id: "child2",
            title: "Child 2",
            url: "child2.html",
            level: 1,
            pages: [],
            parentId: "parent",
          },
        },
        anchors: {},
      },
      topLevelIds: ["parent"],
    };

    const result = buildTree(mockData);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("parent");
    expect(result[0].children).toHaveLength(2);
    expect(result[0].children[0].id).toBe("child1");
    expect(result[0].children[1].id).toBe("child2");
  });

  it("should build a tree with anchors", () => {
    const mockData: TOCData = {
      entities: {
        pages: {
          page: {
            id: "page",
            title: "Test Page",
            url: "page.html",
            level: 0,
            pages: [],
          },
        },
        anchors: {
          anchor1: {
            id: "anchor1",
            title: "Anchor 1",
            url: "page.html#anchor1",
            anchor: "anchor1",
            level: 1,
          },
          anchor2: {
            id: "anchor2",
            title: "Anchor 2",
            url: "page.html#anchor2",
            anchor: "anchor2",
            level: 2,
          },
        },
      },
      topLevelIds: ["page"],
    };

    const result = buildTree(mockData);

    expect(result[0].anchors).toHaveLength(0);
  });

  it("should build a complex tree with multiple levels", () => {
    const mockData: TOCData = {
      entities: {
        pages: {
          root: {
            id: "root",
            title: "Root",
            url: "root.html",
            level: 0,
            pages: ["level1"],
          },
          level1: {
            id: "level1",
            title: "Level 1",
            url: "level1.html",
            level: 1,
            pages: ["level2"],
            parentId: "root",
          },
          level2: {
            id: "level2",
            title: "Level 2",
            url: "level2.html",
            level: 2,
            pages: [],
            parentId: "level1",
          },
        },
        anchors: {},
      },
      topLevelIds: ["root"],
    };

    const result = buildTree(mockData);

    expect(result[0].id).toBe("root");
    expect(result[0].children[0].id).toBe("level1");
    expect(result[0].children[0].children[0].id).toBe("level2");
    expect(result[0].children[0].children[0].children).toHaveLength(0);
  });

  it("should handle multiple root nodes", () => {
    const mockData: TOCData = {
      entities: {
        pages: {
          root1: {
            id: "root1",
            title: "Root 1",
            url: "root1.html",
            level: 0,
            pages: [],
            tabIndex: 0,
          },
          root2: {
            id: "root2",
            title: "Root 2",
            url: "root2.html",
            level: 0,
            pages: [],
            tabIndex: 1,
          },
        },
        anchors: {},
      },
      topLevelIds: ["root1", "root2"],
    };

    const result = buildTree(mockData);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("root1");
    expect(result[1].id).toBe("root2");
  });

  it("should handle pages without children or anchors", () => {
    const mockData: TOCData = {
      entities: {
        pages: {
          page: {
            id: "page",
            title: "Test Page",
            url: "page.html",
            level: 0,
          },
        },
        anchors: {},
      },
      topLevelIds: ["page"],
    };

    const result = buildTree(mockData);

    expect(result[0].children).toEqual([]);
    expect(result[0].anchors).toEqual([]);
  });

  it("should handle empty data", () => {
    const mockData: TOCData = {
      entities: {
        pages: {},
        anchors: {},
      },
      topLevelIds: [],
    };

    const result = buildTree(mockData);

    expect(result).toEqual([]);
  });

  it("should preserve all page properties", () => {
    const mockData: TOCData = {
      entities: {
        pages: {
          page: {
            id: "page",
            title: "Test Page",
            url: "test.html",
            level: 1,
            tabIndex: 5,
            doNotShowWarningLink: true,
            pages: [],
          },
        },
        anchors: {},
      },
      topLevelIds: ["page"],
    };

    const result = buildTree(mockData);

    expect(result[0]).toMatchObject({
      id: "page",
      title: "Test Page",
      url: "test.html",
      level: 1,
      tabIndex: 5,
      doNotShowWarningLink: true,
    });
  });

  it("should handle circular references gracefully", () => {
    const mockData: TOCData = {
      entities: {
        pages: {
          page1: {
            id: "page1",
            title: "Page 1",
            url: "page1.html",
            level: 0,
            pages: ["page2"],
          },
          page2: {
            id: "page2",
            title: "Page 2",
            url: "page2.html",
            level: 1,
            pages: ["page1"],
            parentId: "page1",
          },
        },
        anchors: {},
      },
      topLevelIds: ["page1"],
    };

    expect(() => buildTree(mockData)).toThrow(
      "Maximum call stack size exceeded"
    );
  });

  it("should handle real HelpTOC data", () => {
    const result = buildTree(helpTOCData as unknown as TOCData);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    const firstPage = result[0];
    expect(firstPage).toHaveProperty("id");
    expect(firstPage).toHaveProperty("title");
    expect(firstPage).toHaveProperty("url");
    expect(firstPage).toHaveProperty("level");
    expect(firstPage).toHaveProperty("children");
    expect(firstPage).toHaveProperty("anchors");

    if (firstPage.children.length > 0) {
      const firstChild = firstPage.children[0];
      expect(firstChild).toHaveProperty("id");
      expect(firstChild).toHaveProperty("title");
      expect(firstChild).toHaveProperty("children");
      expect(firstChild).toHaveProperty("anchors");
    }
  });
});
