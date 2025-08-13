import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToCItem } from "./ToCItem";
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
    span: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
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
    activeId: null,
    onActivate: vi.fn(),
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

    const titleElement = screen.getByText("Test Page");

    let containerDiv = titleElement.parentElement;
    while (containerDiv && !containerDiv.style.marginLeft) {
      containerDiv = containerDiv.parentElement;
    }

    expect(containerDiv).toBeTruthy();
    expect(containerDiv?.style.marginLeft).toBe("24px");
  });

  it("should call onActivate when header is clicked", () => {
    render(<ToCItem {...mockProps} />);

    const header = screen.getByText("Test Page");
    fireEvent.click(header);

    expect(mockProps.onActivate).toHaveBeenCalledWith("test-page");
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

    const header = screen.getByText("Test Page");

    expect(screen.queryByText("Child Page")).toBeNull();

    fireEvent.click(header);

    await waitFor(() => {
      expect(screen.getByText("Child Page")).toBeDefined();
    });

    fireEvent.click(header);

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

    const icon = screen.getByText("▶");
    expect(icon).toBeDefined();
  });

  it("should not show expand icon when page has no children", () => {
    render(<ToCItem {...mockProps} />);

    const icon = screen.queryByText("▶");
    expect(icon).toBeNull();
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
    const nodeWithEmptyChildren = { ...mockNode, children: [] };
    render(<ToCItem {...mockProps} node={nodeWithEmptyChildren} />);

    const icon = screen.queryByText("▶");
    expect(icon).toBeNull();
  });

  it("should handle empty anchors array", async () => {
    const nodeWithEmptyAnchors = { ...mockNode, anchors: [] };
    render(
      <ToCItem
        {...mockProps}
        node={nodeWithEmptyAnchors}
        activeId="test-page"
      />
    );

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
});
