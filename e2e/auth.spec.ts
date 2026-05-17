import { test, expect } from '@playwright/test'

const TEST_EMAIL = `e2e-${Date.now()}@example.com`
const TEST_PASSWORD = 'testpassword123'

test.describe('Authentication', () => {
  test('register page loads', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /register|sign up|create/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('registers a new user and lands on the app', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel(/email/i).fill(TEST_EMAIL)
    await page.getByLabel(/password/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /register|sign up|create/i }).click()

    // After registration, user should be redirected away from /register
    await expect(page).not.toHaveURL(/register/)
    // Should land on plan or a main app page
    await expect(page).toHaveURL(/\/plan|\//)
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('shows error on login with wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('nobody@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /log in|sign in/i }).click()

    // An error message should appear
    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({ timeout: 5000 })
  })

  test('logs in with valid credentials', async ({ page }) => {
    // First register
    await page.goto('/register')
    const email = `login-${Date.now()}@example.com`
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/password/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /register|sign up|create/i }).click()
    await page.waitForURL(/\/plan|\//)

    // Then log out (if a logout button exists)
    const logoutBtn = page.getByRole('button', { name: /log ?out|sign ?out/i })
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
      await page.waitForURL(/\/login|\//)
    }

    // Log back in
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/password/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    await expect(page).not.toHaveURL(/login/)
  })

  test('unauthenticated user is redirected to login', async ({ page }) => {
    // Clear any auth state
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())
    await page.goto('/plan')
    await expect(page).toHaveURL(/login|register/, { timeout: 5000 })
  })
})
