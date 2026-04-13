import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { axe } from "vitest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToC } from "./TOC";
import { type TOCNode } from "./types";

vi.mock("../../api/tocApi", () => ({
  fetchTOC: vi.fn(),
}));

vi.mock("../../utils/buildTree", () => ({
  buildTree: vi.fn(),
}));

// Mock virtualizer to render all items in tests
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({
    count,
  }: {
    count: number;
    getScrollElement: () => HTMLElement | null;
    estimateSize: () => number;
    overscan: number;
  }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        index: i,
        start: i * 28,
        size: 28,
        key: i,
      })),
    getTotalSize: () => count * 28,
    scrollToIndex: vi.fn(),
    measureElement: vi.fn(),
  }),
}));

import { fetchTOC } from "../../api/tocApi";
import { buildTree } from "../../utils/buildTree";

const mockTreeData: TOCNode[] = [
  {
    id: "page1",
    title: "Getting Started",
    url: "getting-started.html",
    level: 0,
    children: [
      {
        id: "page1-1",
        title: "Installation",
        url: "installation.html",
        level: 1,
        children: [],
        anchors: [],
      },
    ],
    anchors: [],
  },
  {
    id: "page2",
    title: "Configuration",
    url: "configuration.html",
    level: 0,
    children: [],
    anchors: [],
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("TOC accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have no accessibility violations when loaded", async () => {
    vi.mocked(fetchTOC).mockResolvedValue({
      entities: { pages: {}, anchors: {} },
      topLevelIds: [],
    });
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    const { container } = render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(container.querySelector('[role="tree"]')).toBeTruthy();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no violations with error state", async () => {
    vi.mocked(fetchTOC).mockRejectedValue(new Error("fail"));
    vi.mocked(buildTree).mockReturnValue([]);

    const { container } = render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(container.querySelector('[role="alert"]')).toBeTruthy();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have proper tree roles", async () => {
    vi.mocked(fetchTOC).mockResolvedValue({
      entities: { pages: {}, anchors: {} },
      topLevelIds: [],
    });
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    const { container } = render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      const tree = container.querySelector('[role="tree"]');
      expect(tree).toBeTruthy();

      const treeItems = container.querySelectorAll('[role="treeitem"]');
      expect(treeItems.length).toBe(2);
    });
  });

  it("should have search landmark", async () => {
    vi.mocked(fetchTOC).mockResolvedValue({
      entities: { pages: {}, anchors: {} },
      topLevelIds: [],
    });
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    const { container } = render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      const search = container.querySelector('[role="search"]');
      expect(search).toBeTruthy();
    });
  });
});
