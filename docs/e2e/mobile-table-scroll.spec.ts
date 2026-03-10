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
  test("长表格在移动端应可横向滚动 / Wide table should be horizontally scrollable on mobile", async ({
    page,
  }) => {
    await page.goto("/docs/level-1/paradigm-shift");
    await page.waitForLoadState("domcontentloaded");

    const table = page.locator("table", {
      has: page.locator("th", { hasText: "为什么有代表性" }),
    });
    await expect(table).toBeVisible();

    const tableParent = table.locator("..");

    await expect(tableParent).toHaveAttribute("tabindex", "0");

    const overflowX = await tableParent.evaluate((el) =>
      window.getComputedStyle(el).overflowX,
    );
    expect(overflowX).toBe("auto");

    const metricsBefore = await tableParent.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollLeft: el.scrollLeft,
    }));

    expect(metricsBefore.scrollWidth).toBeGreaterThan(metricsBefore.clientWidth);

    await tableParent.evaluate((el) => {
      el.scrollLeft = 120;
    });

    const scrollLeftAfter = await tableParent.evaluate((el) => el.scrollLeft);
    expect(scrollLeftAfter).toBeGreaterThan(metricsBefore.scrollLeft);
  });
});
