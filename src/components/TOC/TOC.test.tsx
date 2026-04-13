import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToC } from "./TOC";
import { type TOCData, type TOCNode } from "./types";

vi.mock("../../api/tocApi", () => ({
  fetchTOC: vi.fn(),
}));

vi.mock("../../utils/buildTree", () => ({
  buildTree: vi.fn(),
}));

vi.mock("../Loader/Loader", () => ({
  default: () => <div data-testid="loader">Loading TOC...</div>,
}));

vi.mock("./TOCRow", () => ({
  TOCRow: ({
    flatNode,
    activeId,
    onActivate,
  }: {
    flatNode: { node: TOCNode };
    activeId: string | null;
    onActivate: (id: string) => void;
  }) => (
    <li
      data-testid={`toc-item-${flatNode.node.id}`}
      onClick={() => onActivate(flatNode.node.id)}
      className={activeId === flatNode.node.id ? "active" : ""}
    >
      {flatNode.node.title}
    </li>
  ),
}));

// Mock @tanstack/react-virtual to bypass layout requirements
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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("ToC", () => {
  const mockTOCData: TOCData = {
    entities: {
      pages: {
        page1: {
          id: "page1",
          title: "Page 1",
          url: "page1.html",
          level: 0,
          pages: ["page1-1"],
        },
        page2: {
          id: "page2",
          title: "Page 2",
          url: "page2.html",
          level: 0,
          pages: [],
        },
        "page1-1": {
          id: "page1-1",
          title: "Page 1.1",
          url: "page1-1.html",
          level: 1,
          pages: [],
          parentId: "page1",
        },
      },
      anchors: {},
    },
    topLevelIds: ["page1", "page2"],
  };

  const mockTreeData: TOCNode[] = [
    {
      id: "page1",
      title: "Page 1",
      url: "page1.html",
      level: 0,
      children: [
        {
          id: "page1-1",
          title: "Page 1.1",
          url: "page1-1.html",
          level: 1,
          children: [],
          anchors: [],
        },
      ],
      anchors: [],
    },
    {
      id: "page2",
      title: "Page 2",
      url: "page2.html",
      level: 0,
      children: [],
      anchors: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should render loader when loading", () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    expect(screen.getByTestId("loader")).toBeDefined();
    expect(screen.getByText("Loading TOC...")).toBeDefined();
  });

  it("should render TOC items when data is loaded", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Page 1")).toBeDefined();
      expect(screen.getByText("Page 2")).toBeDefined();
    });

    expect(screen.getByTestId("toc-item-page1")).toBeDefined();
    expect(screen.getByTestId("toc-item-page2")).toBeDefined();
  });

  it("should call buildTree with fetched data", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(buildTree).toHaveBeenCalledWith(mockTOCData);
    });
  });

  it("should handle empty tree data", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue([]);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByTestId(/toc-item-/)).toBeNull();
    });
  });

  it("should handle single TOC item", async () => {
    const singleTreeData: TOCNode[] = [
      {
        id: "page1",
        title: "Page 1",
        url: "page1.html",
        level: 0,
        children: [],
        anchors: [],
      },
    ];

    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(singleTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Page 1")).toBeDefined();
      expect(screen.queryByText("Page 2")).toBeNull();
    });
  });

  it("should render with navigation landmark", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      const navElement = screen.getByRole("navigation");
      expect(navElement).toBeDefined();
    });
  });

  it("should render tree role", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      const tree = screen.getByRole("tree");
      expect(tree).toBeDefined();
    });
  });

  it("should handle API error gracefully", async () => {
    vi.mocked(fetchTOC).mockRejectedValue(new Error("API Error"));
    vi.mocked(buildTree).mockReturnValue([]);

    render(<ToC />, { wrapper: createWrapper() });

    expect(screen.getByTestId("loader")).toBeDefined();
  });

  it("should show error state with retry button", async () => {
    vi.mocked(fetchTOC).mockRejectedValue(new Error("API Error"));

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load the table of contents.")
      ).toBeDefined();
    });

    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
  });

  it("should have search form with correct role", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      const searchForm = screen.getByRole("search");
      expect(searchForm).toBeDefined();
    });
  });

  it("should render search input with aria-label", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      const input = screen.getByLabelText("Search in table of contents");
      expect(input).toBeDefined();
    });
  });
});
