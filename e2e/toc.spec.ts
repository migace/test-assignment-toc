import { test, expect } from "@playwright/test";

test.describe("Table of Contents", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[role="tree"]');
  });

  test("should load and display TOC items", async ({ page }) => {
    const treeItems = page.locator('[role="treeitem"]');
    await expect(treeItems.first()).toBeVisible();
    expect(await treeItems.count()).toBeGreaterThan(0);
  });

  test("should have a search form", async ({ page }) => {
    const searchInput = page.getByLabel("Search in table of contents");
    await expect(searchInput).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Search", exact: true })
    ).toBeVisible();
  });

  test("should filter results when searching", async ({ page }) => {
    const searchInput = page.getByLabel("Search in table of contents");
    await searchInput.fill("Getting started");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page.getByText(/Found \d+ result/)).toBeVisible();
  });

  test("should show no results message for non-existent query", async ({
    page,
  }) => {
    const searchInput = page.getByLabel("Search in table of contents");
    await searchInput.fill("xyznonexistent123");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page.getByText(/No results found/)).toBeVisible();
  });

  test("should clear search with clear button", async ({ page }) => {
    const searchInput = page.getByLabel("Search in table of contents");
    await searchInput.fill("test");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page.getByText(/Found \d+ result/)).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).click();

    await expect(page.getByText(/Found \d+ result/)).not.toBeVisible();
    await expect(searchInput).toHaveValue("");
  });

  test("should expand and collapse items with click", async ({ page }) => {
    const firstExpandableItem = page
      .locator('[role="treeitem"][aria-expanded]')
      .first();
    await expect(firstExpandableItem).toHaveAttribute("aria-expanded", "false");

    await firstExpandableItem.locator("div").first().click();

    await expect(firstExpandableItem).toHaveAttribute("aria-expanded", "true");
  });

  test("should navigate with keyboard", async ({ page }) => {
    const firstItem = page.locator('[role="treeitem"]').first();
    await firstItem.focus();

    await page.keyboard.press("ArrowDown");

    const focusedElement = page.locator('[role="treeitem"]:focus');
    await expect(focusedElement).toBeVisible();
  });

  test("should expand items with ArrowRight", async ({ page }) => {
    const firstItem = page.locator('[role="treeitem"]').first();
    await firstItem.focus();

    const hasExpanded = await firstItem.getAttribute("aria-expanded");
    if (hasExpanded === "false") {
      await page.keyboard.press("ArrowRight");
      await expect(firstItem).toHaveAttribute("aria-expanded", "true");
    }
  });

  test("should have proper ARIA structure", async ({ page }) => {
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("tree")).toBeVisible();
    await expect(page.getByRole("search")).toBeVisible();

    const firstItem = page.locator('[role="treeitem"]').first();
    await expect(firstItem).toHaveAttribute("aria-level");
    await expect(firstItem).toHaveAttribute("aria-setsize");
    await expect(firstItem).toHaveAttribute("aria-posinset");
  });

  test("should highlight search matches", async ({ page }) => {
    const searchInput = page.getByLabel("Search in table of contents");
    await searchInput.fill("Getting started");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page.getByText(/Found \d+ result/)).toBeVisible();

    const highlights = page.locator("mark");
    expect(await highlights.count()).toBeGreaterThan(0);
  });

  test("should support dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForSelector('[role="tree"]');

    const container = page.locator('[class*="tocContainer"]');
    await expect(container).toBeVisible();
  });
});

test.describe("Keyboard navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[role="tree"]');
  });

  test("should collapse expanded item with ArrowLeft", async ({ page }) => {
    const firstItem = page.locator('[role="treeitem"]').first();
    await firstItem.focus();

    const hasExpanded = await firstItem.getAttribute("aria-expanded");
    if (hasExpanded === "false") {
      await page.keyboard.press("ArrowRight");
      await expect(firstItem).toHaveAttribute("aria-expanded", "true");
    }

    await firstItem.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(firstItem).toHaveAttribute("aria-expanded", "false");
  });

  test("should activate item with Enter", async ({ page }) => {
    const firstItem = page.locator('[role="treeitem"]').first();
    await firstItem.focus();

    await page.keyboard.press("Enter");
    await expect(firstItem).toHaveAttribute("aria-selected", "true");
  });

  test("should activate item with Space", async ({ page }) => {
    const secondItem = page.locator('[role="treeitem"]').nth(1);
    await secondItem.focus();

    await page.keyboard.press("Space");
    await expect(secondItem).toHaveAttribute("aria-selected", "true");
  });

  test("should jump to first item with Home key", async ({ page }) => {
    const items = page.locator('[role="treeitem"]');
    const secondItem = items.nth(1);
    await secondItem.focus();

    await page.keyboard.press("Home");

    const focused = page.locator('[role="treeitem"]:focus');
    await expect(focused).toBeVisible();
    const focusedLabel = await focused.getAttribute("aria-label");
    const firstLabel = await items.first().getAttribute("aria-label");
    expect(focusedLabel).toBe(firstLabel);
  });

  test("should jump to last item with End key", async ({ page }) => {
    const items = page.locator('[role="treeitem"]');
    const firstItem = items.first();
    await firstItem.focus();

    await page.keyboard.press("End");

    const focused = page.locator('[role="treeitem"]:focus');
    await expect(focused).toBeVisible();
    const focusedLabel = await focused.getAttribute("aria-label");
    const lastLabel = await items.last().getAttribute("aria-label");
    expect(focusedLabel).toBe(lastLabel);
  });

  test("should navigate sequentially through items with ArrowDown", async ({
    page,
  }) => {
    const items = page.locator('[role="treeitem"]');
    const firstItem = items.first();
    await firstItem.focus();

    const firstLabel = await firstItem.getAttribute("aria-label");

    await page.keyboard.press("ArrowDown");

    const focused = page.locator('[role="treeitem"]:focus');
    const focusedLabel = await focused.getAttribute("aria-label");
    expect(focusedLabel).not.toBe(firstLabel);
  });

  test("should navigate up with ArrowUp", async ({ page }) => {
    const items = page.locator('[role="treeitem"]');
    const firstItem = items.first();
    await firstItem.focus();

    await page.keyboard.press("ArrowDown");
    const secondLabel = await page
      .locator('[role="treeitem"]:focus')
      .getAttribute("aria-label");

    await page.keyboard.press("ArrowUp");
    const backLabel = await page
      .locator('[role="treeitem"]:focus')
      .getAttribute("aria-label");

    const firstLabel = await firstItem.getAttribute("aria-label");
    expect(backLabel).toBe(firstLabel);
    expect(secondLabel).not.toBe(firstLabel);
  });
});

test.describe("Search interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[role="tree"]');
  });

  test("should show clear button only when search has value", async ({
    page,
  }) => {
    const clearButton = page.getByRole("button", { name: "Clear search" });
    await expect(clearButton).not.toBeVisible();

    const searchInput = page.getByLabel("Search in table of contents");
    await searchInput.fill("test");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(clearButton).toBeVisible();
  });

  test("should submit search with Enter key", async ({ page }) => {
    const searchInput = page.getByLabel("Search in table of contents");
    await searchInput.fill("Getting started");
    await searchInput.press("Enter");

    await expect(page.getByText(/Found \d+ result/)).toBeVisible();
  });

  test("should preserve tree items that are ancestors of matches", async ({
    page,
  }) => {
    const searchInput = page.getByLabel("Search in table of contents");
    await searchInput.fill("Getting started");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page.getByText(/Found \d+ result/)).toBeVisible();

    const treeItems = page.locator('[role="treeitem"]');
    expect(await treeItems.count()).toBeGreaterThan(0);
  });

  test("should show correct result count", async ({ page }) => {
    const searchInput = page.getByLabel("Search in table of contents");
    await searchInput.fill("Getting started");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    const resultInfo = page.getByText(/Found \d+ result/);
    await expect(resultInfo).toBeVisible();
    const text = await resultInfo.textContent();
    expect(text).toMatch(/Found \d+ results? for/);
  });
});

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[role="tree"]');
  });

  test("should have navigation landmark with label", async ({ page }) => {
    const nav = page.getByRole("navigation", {
      name: "Table of contents",
    });
    await expect(nav).toBeVisible();
  });

  test("should have search landmark", async ({ page }) => {
    const search = page.getByRole("search");
    await expect(search).toBeVisible();
  });

  test("should have labeled search input", async ({ page }) => {
    const input = page.getByLabel("Search in table of contents");
    await expect(input).toBeVisible();
  });

  test("should have aria-selected on active items", async ({ page }) => {
    const firstItem = page.locator('[role="treeitem"]').first();
    await expect(firstItem).toHaveAttribute("aria-selected", "false");

    await firstItem.locator("div").first().click();

    await expect(firstItem).toHaveAttribute("aria-selected", "true");
  });

  test("should set tabIndex correctly for focus management", async ({
    page,
  }) => {
    const items = page.locator('[role="treeitem"]');
    const firstItem = items.first();

    await firstItem.focus();
    await expect(firstItem).toHaveAttribute("tabindex", "0");

    const secondItem = items.nth(1);
    await expect(secondItem).toHaveAttribute("tabindex", "-1");
  });
});
