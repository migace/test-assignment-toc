import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToCItem } from "./TOCItem";
import { type TOCNode } from "./types";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
    ul: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <ul {...props}>{children}</ul>,
    span: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useReducedMotion: () => false,
}));

describe("TOCItem", () => {
  const mockNode: TOCNode = {
    id: "test-page",
    title: "Test Page",
    url: "test.html",
    level: 0,
    children: [],
    anchors: [],
  };

  const mockProps = {
    node: mockNode,
    activeId: null as string | null,
    focusedId: null as string | null,
    onActivate: vi.fn(),
    onFocusNode: vi.fn(),
    onMoveFocus: vi.fn(),
    setSize: 1,
    posInSet: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render page title", () => {
    render(<ToCItem {...mockProps} />);

    expect(screen.getByText("Test Page")).toBeDefined();
  });

  it("should render with correct indentation based on level", () => {
    const nodeWithLevel = { ...mockNode, level: 2 };
    render(<ToCItem {...mockProps} node={nodeWithLevel} />);

    const item = screen.getByRole("treeitem");
    expect(item.dataset.level).toBe("2");
  });

  it("should call onActivate when header is clicked", () => {
    render(<ToCItem {...mockProps} />);

    fireEvent.click(screen.getByText("Test Page"));

    expect(mockProps.onActivate).toHaveBeenCalledWith("test-page");
  });

  it("should call onFocusNode when header is clicked", () => {
    render(<ToCItem {...mockProps} />);

    fireEvent.click(screen.getByText("Test Page"));

    expect(mockProps.onFocusNode).toHaveBeenCalledWith("test-page");
  });

  it("should toggle expanded state when header is clicked", async () => {
    const nodeWithChildren = {
      ...mockNode,
      children: [
        {
          id: "child-page",
          title: "Child Page",
          url: "child.html",
          level: 1,
          children: [],
          anchors: [],
        },
      ],
    };

    render(<ToCItem {...mockProps} node={nodeWithChildren} />);

    expect(screen.queryByText("Child Page")).toBeNull();

    fireEvent.click(screen.getByText("Test Page"));

    await waitFor(() => {
      expect(screen.getByText("Child Page")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Test Page"));

    await waitFor(() => {
      expect(screen.queryByText("Child Page")).toBeNull();
    });
  });

  it("should show expand icon when page has children", () => {
    const nodeWithChildren = {
      ...mockNode,
      children: [
        {
          id: "child-page",
          title: "Child Page",
          url: "child.html",
          level: 1,
          children: [],
          anchors: [],
        },
      ],
    };

    render(<ToCItem {...mockProps} node={nodeWithChildren} />);

    expect(screen.getByText("▶")).toBeDefined();
  });

  it("should not show expand icon when page has no children", () => {
    render(<ToCItem {...mockProps} />);

    expect(screen.queryByText("▶")).toBeNull();
  });

  it("should render children recursively", () => {
    const nodeWithChildren = {
      ...mockNode,
      children: [
        {
          id: "child-page",
          title: "Child Page",
          url: "child.html",
          level: 1,
          children: [
            {
              id: "grandchild-page",
              title: "Grandchild Page",
              url: "grandchild.html",
              level: 2,
              children: [],
              anchors: [],
            },
          ],
          anchors: [],
        },
      ],
      anchors: [],
    };

    render(<ToCItem {...mockProps} node={nodeWithChildren} />);

    fireEvent.click(screen.getByText("Test Page"));

    fireEvent.click(screen.getByText("Child Page"));

    expect(screen.getByText("Grandchild Page")).toBeDefined();
  });

  it("should render anchors when page is active and expanded", async () => {
    const nodeWithAnchors = {
      ...mockNode,
      anchors: [
        {
          id: "anchor1",
          title: "Anchor 1",
          url: "test.html",
          anchor: "#anchor1",
          level: 1,
        },
        {
          id: "anchor2",
          title: "Anchor 2",
          url: "test.html",
          anchor: "#anchor2",
          level: 2,
        },
      ],
    };

    render(
      <ToCItem {...mockProps} node={nodeWithAnchors} activeId="test-page" />
    );

    fireEvent.click(screen.getByText("Test Page"));

    await waitFor(() => {
      expect(screen.getByText("Anchor 1")).toBeDefined();
      expect(screen.getByText("Anchor 2")).toBeDefined();
    });
  });

  it("should not render anchors when page is not active", async () => {
    const nodeWithAnchors = {
      ...mockNode,
      anchors: [
        {
          id: "anchor1",
          title: "Anchor 1",
          url: "test.html",
          anchor: "#anchor1",
          level: 1,
        },
      ],
    };

    render(
      <ToCItem {...mockProps} node={nodeWithAnchors} activeId="other-page" />
    );

    fireEvent.click(screen.getByText("Test Page"));

    await waitFor(() => {
      expect(screen.queryByText("Anchor 1")).toBeNull();
    });
  });

  it("should render anchor links with correct href", async () => {
    const nodeWithAnchors = {
      ...mockNode,
      anchors: [
        {
          id: "anchor1",
          title: "Anchor 1",
          url: "test.html",
          anchor: "#anchor1",
          level: 1,
        },
      ],
    };

    render(
      <ToCItem {...mockProps} node={nodeWithAnchors} activeId="test-page" />
    );

    fireEvent.click(screen.getByText("Test Page"));

    await waitFor(() => {
      const anchorLink = screen.getByText("Anchor 1");
      expect(anchorLink.getAttribute("href")).toBe("test.html#anchor1");
    });
  });

  it("should apply active class when page is active", () => {
    render(<ToCItem {...mockProps} activeId="test-page" />);

    const titleElement = screen.getByText("Test Page");
    const headerDiv = titleElement.parentElement;

    expect(headerDiv?.className).toContain("active");
  });

  it("should not apply active class when page is not active", () => {
    render(<ToCItem {...mockProps} activeId="other-page" />);

    const titleElement = screen.getByText("Test Page");
    const headerDiv = titleElement.parentElement;

    expect(headerDiv?.className).not.toContain("active");
  });

  it("should handle empty children array", () => {
    render(<ToCItem {...mockProps} />);

    expect(screen.queryByText("▶")).toBeNull();
  });

  it("should handle empty anchors array", async () => {
    render(<ToCItem {...mockProps} activeId="test-page" />);

    fireEvent.click(screen.getByText("Test Page"));

    await waitFor(() => {
      expect(screen.queryByRole("link")).toBeNull();
    });
  });

  it("should preserve all node properties", () => {
    const nodeWithAllProperties = {
      ...mockNode,
      tabIndex: 5,
      doNotShowWarningLink: true,
      parentId: "parent-page",
      pages: ["child1", "child2"],
    };

    render(<ToCItem {...mockProps} node={nodeWithAllProperties} />);

    expect(screen.getByText("Test Page")).toBeDefined();
  });

  describe("WAI-ARIA tree pattern", () => {
    it("should have role treeitem", () => {
      render(<ToCItem {...mockProps} />);

      expect(screen.getByRole("treeitem")).toBeDefined();
    });

    it("should set aria-expanded for items with children", () => {
      const nodeWithChildren = {
        ...mockNode,
        children: [
          {
            id: "child",
            title: "Child",
            url: "c.html",
            level: 1,
            children: [],
            anchors: [],
          },
        ],
      };

      render(<ToCItem {...mockProps} node={nodeWithChildren} />);

      const item = screen.getByRole("treeitem");
      expect(item.getAttribute("aria-expanded")).toBe("false");
    });

    it("should not set aria-expanded for leaf items", () => {
      render(<ToCItem {...mockProps} />);

      const item = screen.getByRole("treeitem");
      expect(item.getAttribute("aria-expanded")).toBeNull();
    });

    it("should set aria-selected for active item", () => {
      render(<ToCItem {...mockProps} activeId="test-page" />);

      const item = screen.getByRole("treeitem");
      expect(item.getAttribute("aria-selected")).toBe("true");
    });

    it("should set aria-level, aria-setsize, aria-posinset", () => {
      render(<ToCItem {...mockProps} setSize={5} posInSet={3} />);

      const item = screen.getByRole("treeitem");
      expect(item.getAttribute("aria-level")).toBe("1");
      expect(item.getAttribute("aria-setsize")).toBe("5");
      expect(item.getAttribute("aria-posinset")).toBe("3");
    });

    it("should set tabIndex 0 when focused, -1 otherwise", () => {
      const { rerender } = render(<ToCItem {...mockProps} focusedId={null} />);

      expect(screen.getByRole("treeitem").tabIndex).toBe(-1);

      rerender(<ToCItem {...mockProps} focusedId="test-page" />);

      expect(screen.getByRole("treeitem").tabIndex).toBe(0);
    });
  });

  describe("keyboard navigation", () => {
    it("should expand on ArrowRight when collapsed with children", () => {
      const nodeWithChildren = {
        ...mockNode,
        children: [
          {
            id: "child",
            title: "Child",
            url: "c.html",
            level: 1,
            children: [],
            anchors: [],
          },
        ],
      };

      render(<ToCItem {...mockProps} node={nodeWithChildren} />);

      const item = screen.getByRole("treeitem");
      fireEvent.keyDown(item, { key: "ArrowRight" });

      expect(screen.getByText("Child")).toBeDefined();
    });

    it("should move focus to first child on ArrowRight when expanded", () => {
      const nodeWithChildren = {
        ...mockNode,
        children: [
          {
            id: "child",
            title: "Child",
            url: "c.html",
            level: 1,
            children: [],
            anchors: [],
          },
        ],
      };

      render(<ToCItem {...mockProps} node={nodeWithChildren} />);

      const item = screen.getByRole("treeitem", { name: "Test Page" });
      // First expand
      fireEvent.keyDown(item, { key: "ArrowRight" });
      // Then move to child
      fireEvent.keyDown(item, { key: "ArrowRight" });

      expect(mockProps.onFocusNode).toHaveBeenCalledWith("child");
    });

    it("should collapse on ArrowLeft when expanded with children", () => {
      const nodeWithChildren = {
        ...mockNode,
        children: [
          {
            id: "child",
            title: "Child",
            url: "c.html",
            level: 1,
            children: [],
            anchors: [],
          },
        ],
      };

      render(<ToCItem {...mockProps} node={nodeWithChildren} />);

      // Expand first
      fireEvent.keyDown(screen.getByRole("treeitem"), { key: "ArrowRight" });
      expect(screen.getByText("Child")).toBeDefined();

      // Collapse
      fireEvent.keyDown(screen.getByRole("treeitem", { name: "Test Page" }), {
        key: "ArrowLeft",
      });

      expect(screen.queryByText("Child")).toBeNull();
    });

    it("should call onMoveFocus with parent on ArrowLeft when collapsed", () => {
      render(<ToCItem {...mockProps} />);

      fireEvent.keyDown(screen.getByRole("treeitem"), { key: "ArrowLeft" });

      expect(mockProps.onMoveFocus).toHaveBeenCalledWith("test-page", "parent");
    });

    it("should call onMoveFocus down on ArrowDown", () => {
      render(<ToCItem {...mockProps} />);

      fireEvent.keyDown(screen.getByRole("treeitem"), { key: "ArrowDown" });

      expect(mockProps.onMoveFocus).toHaveBeenCalledWith("test-page", "down");
    });

    it("should call onMoveFocus up on ArrowUp", () => {
      render(<ToCItem {...mockProps} />);

      fireEvent.keyDown(screen.getByRole("treeitem"), { key: "ArrowUp" });

      expect(mockProps.onMoveFocus).toHaveBeenCalledWith("test-page", "up");
    });

    it("should call onMoveFocus home on Home", () => {
      render(<ToCItem {...mockProps} />);

      fireEvent.keyDown(screen.getByRole("treeitem"), { key: "Home" });

      expect(mockProps.onMoveFocus).toHaveBeenCalledWith("test-page", "home");
    });

    it("should call onMoveFocus end on End", () => {
      render(<ToCItem {...mockProps} />);

      fireEvent.keyDown(screen.getByRole("treeitem"), { key: "End" });

      expect(mockProps.onMoveFocus).toHaveBeenCalledWith("test-page", "end");
    });

    it("should activate on Enter", () => {
      render(<ToCItem {...mockProps} />);

      fireEvent.keyDown(screen.getByRole("treeitem"), { key: "Enter" });

      expect(mockProps.onActivate).toHaveBeenCalledWith("test-page");
    });

    it("should activate on Space", () => {
      render(<ToCItem {...mockProps} />);

      fireEvent.keyDown(screen.getByRole("treeitem"), { key: " " });

      expect(mockProps.onActivate).toHaveBeenCalledWith("test-page");
    });
  });

  describe("search highlighting", () => {
    it("should highlight matching text when highlightQuery is set", () => {
      render(<ToCItem {...mockProps} highlightQuery="Test" />);

      const mark = screen.getByText("Test");
      expect(mark.tagName).toBe("MARK");
    });

    it("should not highlight when no query", () => {
      render(<ToCItem {...mockProps} />);

      const title = screen.getByText("Test Page");
      expect(title.tagName).not.toBe("MARK");
    });
  });
});
