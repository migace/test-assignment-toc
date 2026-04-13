import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TOCRow } from "./TOCRow";
import type { FlatNode } from "./hooks/useFlattenedTree";
import type { TOCNode } from "./types";
import "./TOC.module.css";

const makeNode = (
  id: string,
  title: string,
  level: number,
  children: TOCNode[] = [],
  anchors: TOCNode["anchors"] = []
): TOCNode => ({
  id,
  title,
  url: `${id}.html`,
  level,
  children,
  anchors,
});

const makeFlatNode = (
  node: TOCNode,
  overrides: Partial<Omit<FlatNode, "node">> = {}
): FlatNode => ({
  node,
  depth: node.level,
  hasChildren: node.children.length > 0,
  isExpanded: false,
  setSize: 1,
  posInSet: 1,
  parentId: null,
  ...overrides,
});

const meta: Meta<typeof TOCRow> = {
  title: "Components/TOCRow",
  component: TOCRow,
  decorators: [
    (Story) => (
      <ul
        role="tree"
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          width: 340,
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <Story />
      </ul>
    ),
  ],
  args: {
    activeId: null,
    focusedId: null,
    onActivate: fn(),
    onToggle: fn(),
    onFocusNode: fn(),
    onMoveFocus: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TOCRow>;

export const Default: Story = {
  args: {
    flatNode: makeFlatNode(makeNode("getting-started", "Getting Started", 0)),
  },
};

export const Active: Story = {
  args: {
    flatNode: makeFlatNode(makeNode("getting-started", "Getting Started", 0)),
    activeId: "getting-started",
  },
};

export const WithChildren: Story = {
  args: {
    flatNode: makeFlatNode(
      makeNode("getting-started", "Getting Started", 0, [
        makeNode("install", "Installation", 1),
      ]),
      { hasChildren: true }
    ),
  },
};

export const ExpandedWithChildren: Story = {
  args: {
    flatNode: makeFlatNode(
      makeNode("getting-started", "Getting Started", 0, [
        makeNode("install", "Installation", 1),
      ]),
      { hasChildren: true, isExpanded: true }
    ),
  },
};

export const NestedLevel: Story = {
  args: {
    flatNode: makeFlatNode(makeNode("deep-item", "Deep Nested Item", 3), {
      depth: 3,
    }),
  },
};

export const WithHighlight: Story = {
  args: {
    flatNode: makeFlatNode(makeNode("getting-started", "Getting Started", 0)),
    highlightQuery: "Start",
  },
};

export const WithAnchors: Story = {
  args: {
    flatNode: makeFlatNode(
      makeNode(
        "api",
        "API Reference",
        0,
        [],
        [
          {
            id: "a1",
            title: "Authentication",
            url: "api.html",
            anchor: "auth",
            level: 1,
          },
          {
            id: "a2",
            title: "Endpoints",
            url: "api.html",
            anchor: "endpoints",
            level: 1,
          },
        ]
      ),
      { isExpanded: true }
    ),
    activeId: "api",
  },
};

export const Focused: Story = {
  args: {
    flatNode: makeFlatNode(makeNode("focused-item", "Focused Item", 0)),
    focusedId: "focused-item",
  },
};
