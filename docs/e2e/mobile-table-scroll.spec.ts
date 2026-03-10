import { expect, test } from "@playwright/test";

/**
 * 移动端表格水平滚动测试
 * Mobile table horizontal scroll test
 *
 * 验证：在 375px 视口下，MDX 表格的父容器应具有 overflow-x: auto 属性，
 * 使表格可以在容器内水平滚动，而不是撑破页面。
 *
 * Asserts: On a 375px viewport, the MDX table's parent container should have
 * overflow-x: auto so the table scrolls within its container.
 */
test.describe("移动端表格溢出修复 / Mobile table overflow fix", () => {
  test("表格父容器应具有 overflow-x: auto / Table parent should have overflow-x: auto", async ({
    page,
  }) => {
    // 导航到包含表格的页面（首页有"本书结构一览"表格）
    // Navigate to a page with a table (index page has the "book structure" table)
    await page.goto("/docs");
    await page.waitForLoadState("domcontentloaded");

    // 定位第一个 <table> 元素
    // Locate the first <table> element
    const table = page.locator("table").first();
    await expect(table).toBeVisible();

    // 获取表格的直接父容器
    // Get the table's direct parent container
    const tableParent = table.locator("..");

    // 验证父容器的 overflow-x 计算样式为 "auto"
    // Assert the parent's computed overflow-x style is "auto"
    const overflowX = await tableParent.evaluate((el) => {
      return window.getComputedStyle(el).overflowX;
    });

    expect(overflowX).toBe("auto");
  });

  test("表格不应超出视口宽度 / Table should not overflow viewport width", async ({
    page,
  }) => {
    await page.goto("/docs");
    await page.waitForLoadState("domcontentloaded");

    const table = page.locator("table").first();
    await expect(table).toBeVisible();

    // 获取表格父容器的宽度，确认它不超出视口
    // Get the table parent's width, confirm it doesn't exceed viewport
    const tableParent = table.locator("..");
    const parentBox = await tableParent.boundingBox();
    const viewportSize = page.viewportSize();

    expect(parentBox).not.toBeNull();
    expect(viewportSize).not.toBeNull();

    if (parentBox && viewportSize) {
      // 父容器右边界不应超出视口宽度
      // Parent container's right edge should not exceed viewport width
      expect(parentBox.x + parentBox.width).toBeLessThanOrEqual(
        viewportSize.width,
      );
    }
  });
});
