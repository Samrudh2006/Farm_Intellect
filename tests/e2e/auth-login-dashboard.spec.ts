import { expect, test, type Page } from "@playwright/test";

const roleDashboardPath = {
  farmer: /\/farmer\/dashboard$/,
  merchant: /\/merchant\/dashboard$/,
} as const;

const aadhaarFor = () => String(700000000000 + Math.floor(Date.now() % 100000000000)).padStart(12, "0").slice(0, 12);

async function captureCrashes(page: Page) {
  const crashes: string[] = [];
  page.on("pageerror", (error) => crashes.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /Uncaught|Login blocked|Profile Loading Failed/i.test(message.text())) {
      crashes.push(message.text());
    }
  });
  return () => expect(crashes, crashes.join("\n")).toHaveLength(0);
}

async function chooseRole(page: Page, role: "farmer" | "merchant") {
  await page.goto("/login");
  await page.getByTestId(`role-card-${role}`).click();
}

async function signUp(page: Page, role: "farmer" | "merchant", aadhaar: string, passkey: string) {
  await chooseRole(page, role);
  await page.getByRole("button", { name: /don't have|no account|sign up/i }).click();
  await page.locator("#name").fill(`E2E ${role}`);
  await page.locator("#phone").fill("9876543210");
  await page.locator("#aadhaar").fill(aadhaar);
  await page.locator("#passkey").fill(passkey);
  await page.locator("#confirm-passkey").fill(passkey);
  await page.getByTestId("auth-submit").click();
}

async function signIn(page: Page, role: "farmer" | "merchant", aadhaar: string, passkey: string) {
  await chooseRole(page, role);
  await page.locator("#phone").fill("9876543210");
  await page.locator("#aadhaar").fill(aadhaar);
  await page.locator("#passkey").fill(passkey);
  await page.getByTestId("auth-submit").click();
}

test.describe("auth login to dashboard", () => {
  test("new farmer account opens the farmer dashboard after profile repair", async ({ page }) => {
    const assertNoCrash = await captureCrashes(page);
    const aadhaar = aadhaarFor();
    const passkey = `E2e#${Date.now()}`;

    await signUp(page, "farmer", aadhaar, passkey);
    await expect(page).toHaveURL(roleDashboardPath.farmer, { timeout: 30_000 });
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText(/welcome/i).first()).toBeVisible();
    assertNoCrash();
  });

  test("existing merchant account signs back in to merchant dashboard", async ({ page, context }) => {
    const assertNoCrash = await captureCrashes(page);
    const aadhaar = aadhaarFor();
    const passkey = `E2e#${Date.now()}`;

    await signUp(page, "merchant", aadhaar, passkey);
    await expect(page).toHaveURL(roleDashboardPath.merchant, { timeout: 30_000 });
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await signIn(page, "merchant", aadhaar, passkey);
    await expect(page).toHaveURL(roleDashboardPath.merchant, { timeout: 30_000 });
    await expect(page.getByRole("main")).toBeVisible();
    assertNoCrash();
  });
});