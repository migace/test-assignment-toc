import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TOCRow } from "./TOCRow";
import type { FlatNode } from "./hooks/useFlattenedTree";
import type { TOCNode } from "./types";

const makeNode = (
  id: string,
  title: string,
  overrides: Partial<TOCNode> = {}
): TOCNode => ({
  id,
  title,
  url: `${id}.html`,
  level: 0,
  children: [],
  anchors: [],
  ...overrides,
});

const makeFlatNode = (
  node: TOCNode,
  overrides: Partial<Omit<FlatNode, "node">> = {}
): FlatNode => ({
  node,
  depth: 0,
  hasChildren: node.children.length > 0,
  isExpanded: false,
  setSize: 1,
  posInSet: 1,
  parentId: null,
  ...overrides,
});

const defaultProps = {
  activeId: null,
  focusedId: null,
  onActivate: vi.fn(),
  onToggle: vi.fn(),
  onFocusNode: vi.fn(),
  onMoveFocus: vi.fn(),
};

const renderRow = (
  flatNode: FlatNode,
  props: Partial<typeof defaultProps> = {}
) =>
  render(
    <ul role="tree">
      <TOCRow flatNode={flatNode} {...defaultProps} {...props} />
    </ul>
  );

describe("TOCRow", () => {
  describe("rendering", () => {
    it("should render with treeitem role", () => {
      const flatNode = makeFlatNode(makeNode("n1", "Node 1"));
      renderRow(flatNode);

      expect(screen.getByRole("treeitem")).toBeDefined();
    });

    it("should display the node title", () => {
      const flatNode = makeFlatNode(makeNode("n1", "Getting Started"));
      renderRow(flatNode);

      expect(screen.getByText("Getting Started")).toBeDefined();
    });

    it("should set correct ARIA attributes", () => {
      const flatNode = makeFlatNode(makeNode("n1", "Node 1"), {
        depth: 2,
        setSize: 5,
        posInSet: 3,
      });
      renderRow(flatNode);

      const item = screen.getByRole("treeitem");
      expect(item.getAttribute("aria-level")).toBe("3");
      expect(item.getAttribute("aria-setsize")).toBe("5");
      expect(item.getAttribute("aria-posinset")).toBe("3");
      expect(item.getAttribute("aria-label")).toBe("Node 1");
    });

    it("should set aria-selected when active", () => {
      const flatNode = makeFlatNode(makeNode("n1", "Node 1"));
      renderRow(flatNode, { activeId: "n1" });

      expect(screen.getByRole("treeitem").getAttribute("aria-selected")).toBe(
        "true"
      );
    });

    it("should not have aria-expanded for leaf nodes", () => {
      const flatNode = makeFlatNode(makeNode("n1", "Leaf"));
      renderRow(flatNode);

      expect(screen.getByRole("treeitem").hasAttribute("aria-expanded")).toBe(
        false
      );
    });

    it("should set aria-expanded for parent nodes", () => {
      const node = makeNode("n1", "Parent", {
        children: [makeNode("c1", "Child")],
      });
      const flatNode = makeFlatNode(node, {
        hasChildren: true,
        isExpanded: false,
      });
      renderRow(flatNode);

      expect(screen.getByRole("treeitem").getAttribute("aria-expanded")).toBe(
        "false"
      );
    });

    it("should show expand icon for parent nodes", () => {
      const node = makeNode("n1", "Parent", {
        children: [makeNode("c1", "Child")],
      });
      const flatNode = makeFlatNode(node, { hasChildren: true });
      renderRow(flatNode);

      expect(screen.getByText("▶")).toBeDefined();
    });

    it("should not show expand icon for leaf nodes", () => {
      const flatNode = makeFlatNode(makeNode("n1", "Leaf"));
      renderRow(flatNode);

      expect(screen.queryByText("▶")).toBeNull();
    });

    it("should highlight text when highlightQuery is provided", () => {
      const flatNode = makeFlatNode(makeNode("n1", "Getting Started"));
      render(
        <ul role="tree">
          <TOCRow
            flatNode={flatNode}
            {...defaultProps}
            highlightQuery="Start"
          />
        </ul>
      );

      expect(screen.getByText("Start").tagName).toBe("MARK");
    });

    it("should render anchors when active and expanded", () => {
      const node = makeNode("n1", "API", {
        children: [makeNode("c1", "Child")],
        anchors: [
          {
            id: "a1",
            title: "Auth",
            url: "api.html",
            anchor: "auth",
            level: 1,
          },
        ],
      });
      const flatNode = makeFlatNode(node, {
        hasChildren: true,
        isExpanded: true,
      });
      renderRow(flatNode, { activeId: "n1" });

      expect(screen.getByText("Auth")).toBeDefined();
    });
  });

  describe("focus management", () => {
    it("should have tabIndex 0 when focused", () => {
      const flatNode = makeFlatNode(makeNode("n1", "Node 1"));
      renderRow(flatNode, { focusedId: "n1" });

      expect(screen.getByRole("treeitem").getAttribute("tabindex")).toBe("0");
    });

    it("should have tabIndex -1 when not focused", () => {
      const flatNode = makeFlatNode(makeNode("n1", "Node 1"));
      renderRow(flatNode, { focusedId: "other" });

      expect(screen.getByRole("treeitem").getAttribute("tabindex")).toBe("-1");
    });
  });

  describe("click interaction", () => {
    it("should call onActivate and onFocusNode on click", async () => {
      const user = userEvent.setup();
      const onActivate = vi.fn();
      const onFocusNode = vi.fn();
      const flatNode = makeFlatNode(makeNode("n1", "Node 1"));
      renderRow(flatNode, { onActivate, onFocusNode });

      await user.click(screen.getByText("Node 1"));

      expect(onActivate).toHaveBeenCalledWith("n1");
      expect(onFocusNode).toHaveBeenCalledWith("n1");
    });

    it("should call onToggle on click for parent nodes", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const node = makeNode("n1", "Parent", {
        children: [makeNode("c1", "Child")],
      });
      const flatNode = makeFlatNode(node, { hasChildren: true });
      renderRow(flatNode, { onToggle });

      await user.click(screen.getByText("Parent"));

      expect(onToggle).toHaveBeenCalledWith("n1");
    });

    it("should not call onToggle on click for leaf nodes", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const flatNode = makeFlatNode(makeNode("n1", "Leaf"));
      renderRow(flatNode, { onToggle });

      await user.click(screen.getByText("Leaf"));

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe("keyboard navigation", () => {
    it("should expand on ArrowRight when collapsed with children", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const node = makeNode("n1", "Parent", {
        children: [makeNode("c1", "Child")],
      });
      const flatNode = makeFlatNode(node, {
        hasChildren: true,
        isExpanded: false,
      });
      renderRow(flatNode, { onToggle, focusedId: "n1" });

      await user.keyboard("{ArrowRight}");

      expect(onToggle).toHaveBeenCalledWith("n1");
    });

    it("should move focus down on ArrowRight when expanded with children", async () => {
      const user = userEvent.setup();
      const onMoveFocus = vi.fn();
      const node = makeNode("n1", "Parent", {
        children: [makeNode("c1", "Child")],
      });
      const flatNode = makeFlatNode(node, {
        hasChildren: true,
        isExpanded: true,
      });
      renderRow(flatNode, { onMoveFocus, focusedId: "n1" });

      await user.keyboard("{ArrowRight}");

      expect(onMoveFocus).toHaveBeenCalledWith("n1", "down");
    });

    it("should collapse on ArrowLeft when expanded with children", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const node = makeNode("n1", "Parent", {
        children: [makeNode("c1", "Child")],
      });
      const flatNode = makeFlatNode(node, {
        hasChildren: true,
        isExpanded: true,
      });
      renderRow(flatNode, { onToggle, focusedId: "n1" });

      await user.keyboard("{ArrowLeft}");

      expect(onToggle).toHaveBeenCalledWith("n1");
    });

    it("should move to parent on ArrowLeft for leaf node", async () => {
      const user = userEvent.setup();
      const onMoveFocus = vi.fn();
      const flatNode = makeFlatNode(makeNode("n1", "Leaf"));
      renderRow(flatNode, { onMoveFocus, focusedId: "n1" });

      await user.keyboard("{ArrowLeft}");

      expect(onMoveFocus).toHaveBeenCalledWith("n1", "parent");
    });

    it("should move down on ArrowDown", async () => {
      const user = userEvent.setup();
      const onMoveFocus = vi.fn();
      const flatNode = makeFlatNode(makeNode("n1", "Node"));
      renderRow(flatNode, { onMoveFocus, focusedId: "n1" });

      await user.keyboard("{ArrowDown}");

      expect(onMoveFocus).toHaveBeenCalledWith("n1", "down");
    });

    it("should move up on ArrowUp", async () => {
      const user = userEvent.setup();
      const onMoveFocus = vi.fn();
      const flatNode = makeFlatNode(makeNode("n1", "Node"));
      renderRow(flatNode, { onMoveFocus, focusedId: "n1" });

      await user.keyboard("{ArrowUp}");

      expect(onMoveFocus).toHaveBeenCalledWith("n1", "up");
    });

    it("should move to first on Home", async () => {
      const user = userEvent.setup();
      const onMoveFocus = vi.fn();
      const flatNode = makeFlatNode(makeNode("n1", "Node"));
      renderRow(flatNode, { onMoveFocus, focusedId: "n1" });

      await user.keyboard("{Home}");

      expect(onMoveFocus).toHaveBeenCalledWith("n1", "home");
    });

    it("should move to last on End", async () => {
      const user = userEvent.setup();
      const onMoveFocus = vi.fn();
      const flatNode = makeFlatNode(makeNode("n1", "Node"));
      renderRow(flatNode, { onMoveFocus, focusedId: "n1" });

      await user.keyboard("{End}");

      expect(onMoveFocus).toHaveBeenCalledWith("n1", "end");
    });

    it("should activate and toggle on Enter", async () => {
      const user = userEvent.setup();
      const onActivate = vi.fn();
      const onToggle = vi.fn();
      const node = makeNode("n1", "Parent", {
        children: [makeNode("c1", "Child")],
      });
      const flatNode = makeFlatNode(node, { hasChildren: true });
      renderRow(flatNode, { onActivate, onToggle, focusedId: "n1" });

      await user.keyboard("{Enter}");

      expect(onActivate).toHaveBeenCalledWith("n1");
      expect(onToggle).toHaveBeenCalledWith("n1");
    });

    it("should activate and toggle on Space", async () => {
      const user = userEvent.setup();
      const onActivate = vi.fn();
      const onToggle = vi.fn();
      const node = makeNode("n1", "Parent", {
        children: [makeNode("c1", "Child")],
      });
      const flatNode = makeFlatNode(node, { hasChildren: true });
      renderRow(flatNode, { onActivate, onToggle, focusedId: "n1" });

      await user.keyboard(" ");

      expect(onActivate).toHaveBeenCalledWith("n1");
      expect(onToggle).toHaveBeenCalledWith("n1");
    });
  });
});
