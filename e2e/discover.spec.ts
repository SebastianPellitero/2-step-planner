import { test, expect, type Page } from '@playwright/test'

const EMAIL = `discover-${Date.now()}@example.com`
const PASSWORD = 'discovertest123'

async function loginOrRegister(page: Page) {
  await page.goto('/register')
  await page.getByLabel(/email/i).fill(EMAIL)
  await page.getByLabel(/password/i).fill(PASSWORD)
  await page.getByRole('button', { name: /register|sign up|create/i }).click()
  await page.waitForURL(/\/plan|\//)
}

test.describe('Discover page', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginOrRegister(page)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(EMAIL)
    await page.getByLabel(/password/i).fill(PASSWORD)
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    await page.waitForURL(/\/plan|\//)
    await page.goto('/discover')
  })

  test('discover page loads with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /discover/i })).toBeVisible()
  })

  test('shows all 4 curated lists', async ({ page }) => {
    await expect(page.getByText('Top 50 Restaurants in Tokyo')).toBeVisible()
    await expect(page.getByText('Top 50 Restaurants in Osaka')).toBeVisible()
    await expect(page.getByText('30 Things to Do in Amsterdam')).toBeVisible()
    await expect(page.getByText('20 Things to See in Utrecht')).toBeVisible()
  })

  test('each list card has a "See places" button', async ({ page }) => {
    const seePlacesBtns = page.getByRole('button', { name: /see .* places/i })
    await expect(seePlacesBtns.first()).toBeVisible()
    const count = await seePlacesBtns.count()
    expect(count).toBe(4)
  })

  test('clicking "See places" expands the list', async ({ page }) => {
    const firstBtn = page.getByRole('button', { name: /see .* places/i }).first()
    await firstBtn.click()

    // The expanded section should show individual places
    await expect(page.getByRole('button', { name: /add all to trip/i })).toBeVisible()
    // The toggle should now say "Hide"
    await expect(page.getByRole('button', { name: /hide/i })).toBeVisible()
  })

  test('clicking "Hide" collapses the list', async ({ page }) => {
    // Expand first
    await page.getByRole('button', { name: /see .* places/i }).first().click()
    await expect(page.getByRole('button', { name: /add all to trip/i })).toBeVisible()

    // Collapse
    await page.getByRole('button', { name: /hide/i }).click()
    await expect(page.getByRole('button', { name: /add all to trip/i })).not.toBeVisible()
  })

  test('only one list is expanded at a time', async ({ page }) => {
    const seeBtns = page.getByRole('button', { name: /see .* places/i })
    await seeBtns.nth(0).click()
    await seeBtns.nth(1).click()

    // Only one "Add all to Trip" button should be visible
    const addBtns = page.getByRole('button', { name: /add all to trip/i })
    await expect(addBtns).toHaveCount(1)
  })

  test('"Add all to Trip" opens the trip selection modal', async ({ page }) => {
    await page.getByRole('button', { name: /see .* places/i }).first().click()
    await page.getByRole('button', { name: /add all to trip/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/choose a trip/i)).toBeVisible()
  })

  test('trip modal has a Cancel button that closes it', async ({ page }) => {
    await page.getByRole('button', { name: /see .* places/i }).first().click()
    await page.getByRole('button', { name: /add all to trip/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('discover link in sidebar is active when on /discover', async ({ page }) => {
    const discoverLink = page.getByRole('link', { name: /discover/i })
    await expect(discoverLink).toBeVisible()
    // Active state — check for the primary color style or aria-current
    await expect(discoverLink).toHaveCSS('font-weight', '600')
  })
})
