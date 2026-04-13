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
    await page.reload();
    await page.waitForSelector('[role="tree"]');

    const container = page.locator('[class*="tocContainer"]');
    await expect(container).toBeVisible();
  });
});
