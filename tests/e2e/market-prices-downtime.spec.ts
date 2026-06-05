/**
 * Playwright E2E: market-prices downtime simulation.
 *
 * Setup (run once):
 *   bun add -D @playwright/test && bunx playwright install --with-deps
 *   echo "E2E_BASE_URL=http://localhost:8080" >> .env
 *   bunx playwright test tests/e2e/market-prices-downtime.spec.ts
 *
 * The suite intercepts every request to the `market-prices` edge function and
 * forces a network failure, then asserts that Dashboard, Forum, FieldMap, and
 * CropStatusWidget render their deterministic empty / error / loading states
 * (via the shared `data-ui-state` markers) and never produce uncaught errors.
 */
import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:8080";

async function killMarketPrices(page: Page) {
  await page.route("**/functions/v1/market-prices**", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "simulated downtime" }) }),
  );
}

async function expectNoConsoleCrash(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error" && /Uncaught|ChunkLoadError/.test(msg.text())) errors.push(msg.text());
  });
  return () => expect(errors, errors.join("\n")).toHaveLength(0);
}

test.describe("market-prices downtime renders deterministic UI", () => {
  test("Dashboard renders without crashing and shows a UI-state marker", async ({ page }) => {
    const check = await expectNoConsoleCrash(page);
    await killMarketPrices(page);
    await page.goto(`${BASE}/dashboard`);
    // At least one shared UI-state marker must be present (loading/empty/error).
    await expect(page.locator("[data-ui-state]").first()).toBeVisible({ timeout: 15_000 });
    check();
  });

  test("Forum shows loading/empty/error state, never a blank screen", async ({ page }) => {
    const check = await expectNoConsoleCrash(page);
    await killMarketPrices(page);
    await page.goto(`${BASE}/forum`);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("[data-ui-state]").first()).toBeVisible({ timeout: 15_000 });
    check();
  });

  test("FieldMap shows loading/empty/error state without crash", async ({ page }) => {
    const check = await expectNoConsoleCrash(page);
    await killMarketPrices(page);
    await page.goto(`${BASE}/field-map`);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("[data-ui-state]").first()).toBeVisible({ timeout: 15_000 });
    check();
  });

  test("CropStatusWidget (on Dashboard) renders an empty/error/loading marker", async ({ page }) => {
    const check = await expectNoConsoleCrash(page);
    await killMarketPrices(page);
    await page.goto(`${BASE}/dashboard`);
    // Widget heading is stable; assert the widget area has a deterministic UI state.
    const widget = page.getByText(/Crop Status Overview/i).locator("..").locator("..");
    await expect(widget.locator("[data-ui-state]").first()).toBeVisible({ timeout: 15_000 });
    check();
  });
});
