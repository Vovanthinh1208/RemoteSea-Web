import { test, expect } from "@playwright/test";
for (const width of [375, 768, 1440]) {
  test(`S3-PB52-BR01 skill suggestion selection and responsive layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/qa/sprint3-browser.html");
    await page.getByLabel("Required skills").fill("rE");
    await expect(
      page.getByRole("button", { name: "Python", exact: true })
    ).toHaveCount(0);
    await page.getByRole("button", { name: "React", exact: true }).click();
    await expect(page.getByTestId("selected")).toHaveText('["React"]');
    await expect(page.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "85"
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    await page.screenshot({
      path: `../docs/sprint3-evidence/components-${width}.png`,
      fullPage: true,
    });
  });
}
