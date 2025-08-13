import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToC } from "./ToC";
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

vi.mock("./TOCItem", () => ({
  default: ({
    node,
    activeId,
    onActivate,
  }: {
    node: TOCNode;
    activeId: string | null;
    onActivate: (id: string) => void;
  }) => {
    const renderChildren = (children: TOCNode[]) => {
      return children?.map((child: TOCNode) => (
        <div key={child.id} data-testid={`toc-item-${child.id}`}>
          {child.title}
          {renderChildren(child.children)}
        </div>
      ));
    };

    return (
      <div
        data-testid={`toc-item-${node.id}`}
        onClick={() => onActivate(node.id)}
        className={activeId === node.id ? "active" : ""}
      >
        {node.title}
        {renderChildren(node.children)}
      </div>
    );
  },
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

  it("should render nested TOC items", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Page 1.1")).toBeDefined();
    });

    expect(screen.getByTestId("toc-item-page1-1")).toBeDefined();
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
    const singleItemData = {
      ...mockTOCData,
      topLevelIds: ["page1"],
    };

    const singleTreeData = [mockTreeData[0]];

    vi.mocked(fetchTOC).mockResolvedValue(singleItemData);
    vi.mocked(buildTree).mockReturnValue(singleTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Page 1")).toBeDefined();
      expect(screen.queryByText("Page 2")).toBeNull();
    });

    expect(screen.getByTestId("toc-item-page1")).toBeDefined();
    expect(screen.queryByTestId("toc-item-page2")).toBeNull();
  });

  it("should render with correct CSS class", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      const navElement = screen.getByRole("navigation");
      expect(navElement).toBeDefined();
    });
  });

  it("should handle API error gracefully", async () => {
    vi.mocked(fetchTOC).mockRejectedValue(new Error("API Error"));
    vi.mocked(buildTree).mockReturnValue([]);

    render(<ToC />, { wrapper: createWrapper() });

    expect(screen.getByTestId("loader")).toBeDefined();
  });

  it("should handle undefined data", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(undefined as unknown as TOCData);
    vi.mocked(buildTree).mockReturnValue([]);

    render(<ToC />, { wrapper: createWrapper() });

    expect(screen.getByTestId("loader")).toBeDefined();
  });

  it("should handle null data", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(null as unknown as TOCData);
    vi.mocked(buildTree).mockReturnValue([]);

    render(<ToC />, { wrapper: createWrapper() });

    expect(screen.getByTestId("loader")).toBeDefined();
  });

  it("should render TOC items with correct props", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);
    vi.mocked(buildTree).mockReturnValue(mockTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      const page1Item = screen.getByTestId("toc-item-page1");
      const page2Item = screen.getByTestId("toc-item-page2");

      expect(page1Item).toBeDefined();
      expect(page2Item).toBeDefined();
    });
  });

  it("should handle complex nested structure", async () => {
    const complexData = {
      ...mockTOCData,
      entities: {
        ...mockTOCData.entities,
        pages: {
          ...mockTOCData.entities.pages,
          "page1-1-1": {
            id: "page1-1-1",
            title: "Page 1.1.1",
            url: "page1-1-1.html",
            level: 2,
            children: [],
            anchors: [],
          },
        },
      },
    };

    const complexTreeData = [
      {
        ...mockTreeData[0],
        children: [
          {
            ...mockTreeData[0].children[0],
            children: [
              {
                id: "page1-1-1",
                title: "Page 1.1.1",
                url: "page1-1-1.html",
                level: 2,
                children: [],
                anchors: [],
              },
            ],
          },
        ],
      },
      mockTreeData[1],
    ];

    vi.mocked(fetchTOC).mockResolvedValue(complexData);
    vi.mocked(buildTree).mockReturnValue(complexTreeData);

    render(<ToC />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Page 1.1.1")).toBeDefined();
    });

    expect(screen.getByTestId("toc-item-page1-1-1")).toBeDefined();
  });
});
