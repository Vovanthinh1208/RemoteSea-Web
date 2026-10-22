import { expect, test } from "@playwright/test";

test.describe("locale switching", () => {
  test("switches in place, preserves the current URL, and restores the choice", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/jobs?query=designer#results");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.getByRole("button", { name: "Select display language" }).click();
    await page.getByRole("option", { name: "Tiếng Việt" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(page).toHaveURL(/\/jobs\?query=designer#results$/);
    await expect(
      page.getByRole("button", { name: "Chọn ngôn ngữ hiển thị" })
    ).toContainText("Tiếng Việt");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");

    await page.getByRole("button", { name: "Chọn ngôn ngữ hiển thị" }).click();
    await page.getByRole("option", { name: "English" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveURL(/\/jobs\?query=designer#results$/);
  });

  test("keeps the home page free from horizontal overflow at supported viewports", async ({
    page,
  }) => {
    await page.goto("/");

    for (const locale of ["en", "vi"] as const) {
      if (locale === "vi") {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page
          .getByRole("button", { name: "Select display language" })
          .click();
        await page.getByRole("option", { name: "Tiếng Việt" }).click();
      }

      for (const [width, height] of [
        [320, 568],
        [375, 812],
        [430, 932],
        [768, 1024],
        [1024, 768],
        [1440, 900],
        [1920, 1080],
      ]) {
        await page.setViewportSize({ width, height });
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(
          dimensions.scrollWidth,
          `${locale} at ${width}x${height}`
        ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
      }
    }
  });
});
