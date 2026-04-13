import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useTOCData } from "./useTOCData";
import type { TOCData } from "../types";

vi.mock("../../../api/tocApi", () => ({
  fetchTOC: vi.fn(),
}));

import { fetchTOC } from "../../../api/tocApi";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockTOCData: TOCData = {
  entities: {
    pages: {
      page1: {
        id: "page1",
        title: "Page 1",
        url: "page1.html",
        level: 0,
        pages: [],
      },
    },
    anchors: {},
  },
  topLevelIds: ["page1"],
};

describe("useTOCData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return loading state initially", () => {
    vi.mocked(fetchTOC).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useTOCData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should return transformed data on success", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);

    const { result } = renderHook(() => useTOCData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data![0].id).toBe("page1");
    expect(result.current.data![0].title).toBe("Page 1");
    expect(result.current.data![0].children).toEqual([]);
  });

  it("should return error state on failure", async () => {
    vi.mocked(fetchTOC).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTOCData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe("Network error");
  });

  it("should call fetchTOC exactly once", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);

    renderHook(() => useTOCData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(fetchTOC).toHaveBeenCalledTimes(1);
    });
  });

  it("should provide refetch function", async () => {
    vi.mocked(fetchTOC).mockResolvedValue(mockTOCData);

    const { result } = renderHook(() => useTOCData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});
