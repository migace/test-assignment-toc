import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchTOC } from "./tocApi";

const validTOCData = {
  entities: {
    pages: {
      page1: {
        id: "page1",
        title: "Page 1",
        url: "page1.html",
        level: 0,
      },
    },
    anchors: {},
  },
  topLevelIds: ["page1"],
};

describe("fetchTOC", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(validTOCData),
        })
      )
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch from /api/toc", async () => {
    await fetchTOC();

    expect(fetch).toHaveBeenCalledWith("/api/toc");
  });

  it("should return parsed data on success", async () => {
    const result = await fetchTOC();

    expect(result.topLevelIds).toEqual(["page1"]);
    expect(result.entities.pages.page1.title).toBe("Page 1");
  });

  it("should throw when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        })
      )
    );

    await expect(fetchTOC()).rejects.toThrow("Failed to load TOC");
  });

  it("should throw on invalid response data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ invalid: "data" }),
        })
      )
    );

    await expect(fetchTOC()).rejects.toThrow();
  });

  it("should throw on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("Network failure")))
    );

    await expect(fetchTOC()).rejects.toThrow("Network failure");
  });

  it("should validate optional fields correctly", async () => {
    const dataWithOptionals = {
      entities: {
        pages: {
          page1: {
            id: "page1",
            title: "Page 1",
            url: "page1.html",
            level: 0,
            parentId: "root",
            pages: ["sub1"],
            tabIndex: 0,
            doNotShowWarningLink: true,
          },
        },
        anchors: {
          a1: {
            id: "a1",
            title: "Anchor",
            url: "page.html",
            anchor: "#section",
            level: 1,
          },
        },
      },
      topLevelIds: ["page1"],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(dataWithOptionals),
        })
      )
    );

    const result = await fetchTOC();

    expect(result.entities.pages.page1.parentId).toBe("root");
    expect(result.entities.anchors.a1.title).toBe("Anchor");
  });
});
