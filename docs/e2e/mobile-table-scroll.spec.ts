import { expect, test } from "@playwright/test";

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

    const metricsBefore = await tableParent.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollLeft: el.scrollLeft,
    }));

    expect(metricsBefore.scrollWidth).toBeGreaterThan(
      metricsBefore.clientWidth,
    );

    await tableParent.evaluate((el) => {
      el.scrollLeft = 120;
    });

    const scrollLeftAfter = await tableParent.evaluate((el) => el.scrollLeft);
    expect(scrollLeftAfter).toBeGreaterThan(metricsBefore.scrollLeft);
  });
});
