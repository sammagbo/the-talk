import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/episodes", "/blog", "/about"];

for (const route of publicRoutes) {
  test(`${route} répond et respecte les contrôles d’accessibilité`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator("main#contenu")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("a.skip-link")).toHaveAttribute("href", "#contenu");

    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(scan.violations, JSON.stringify(scan.violations, null, 2)).toEqual([]);
  });
}

test("la politique de présentation et de tests reste visible et indexable correctement", async ({ page, request }) => {
  await page.goto("/episodes");
  await expect(page.getByRole("heading", { name: "Mode Fashion" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Démonstrations techniques" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ep Test" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Episodio teste" })).toBeVisible();

  await page.goto("/episodes/ep-test");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).toContain("/episodes/mode-fashion");
  expect(xml).not.toContain("/episodes/ep-test");
  expect(xml).not.toContain("/episodes/episodio-teste");
});

test("une ancienne URL d’épisode redirige définitivement vers son slug", async ({ request }) => {
  const response = await request.get("/episode/64d08880-0a12-4398-9d10-acd8def76067", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(308);
  expect(new URL(response.headers().location).pathname).toBe("/episodes/mode-fashion");
});
