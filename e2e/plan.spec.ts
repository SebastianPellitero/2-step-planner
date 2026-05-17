import { test, expect, type Page } from '@playwright/test'

const EMAIL = `plan-${Date.now()}@example.com`
const PASSWORD = 'plantest123'

async function register(page: Page) {
  await page.goto('/register')
  await page.getByLabel(/email/i).fill(EMAIL)
  await page.getByLabel(/password/i).fill(PASSWORD)
  await page.getByRole('button', { name: /register|sign up|create/i }).click()
  await page.waitForURL(/\/plan|\//)
}

test.describe('Plan page — trips', () => {
  test.beforeAll(async ({ browser }) => {
    // Register once for all tests in this suite
    const page = await browser.newPage()
    await register(page)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(EMAIL)
    await page.getByLabel(/password/i).fill(PASSWORD)
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    await page.waitForURL(/\/plan|\//)
    await page.goto('/plan')
  })

  test('plan page loads with title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /wishlist|plan|trips/i })).toBeVisible()
  })

  test('can create a new trip', async ({ page }) => {
    const tripName = `Test Trip ${Date.now()}`
    await page.getByRole('button', { name: /\+ trip/i }).click()

    const input = page.getByPlaceholder(/trip name|name/i)
    await input.fill(tripName)
    await page.getByRole('button', { name: /save|create|add/i }).click()

    await expect(page.getByText(tripName)).toBeVisible({ timeout: 5000 })
  })

  test('can open and close the new trip modal', async ({ page }) => {
    await page.getByRole('button', { name: /\+ trip/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Close via the ✕ button
    await page.getByRole('button', { name: '✕' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('Import button is visible in header', async ({ page }) => {
    const importBtn = page.getByRole('button', { name: /import/i })
    await expect(importBtn).toBeVisible()
  })

  test('Export option appears in trip card menu', async ({ page }) => {
    // Create a trip first
    const tripName = `Export Test ${Date.now()}`
    await page.getByRole('button', { name: /\+ trip/i }).click()
    await page.getByPlaceholder(/trip name|name/i).fill(tripName)
    await page.getByRole('button', { name: /save|create|add/i }).click()
    await expect(page.getByText(tripName)).toBeVisible({ timeout: 5000 })

    // Open the ··· menu on the card
    await page.getByText(tripName).locator('..').locator('..').getByRole('button', { name: '···' }).click()
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible()
  })

  test('sidebar shows navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /plan/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /explore/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /discover/i })).toBeVisible()
  })
})
