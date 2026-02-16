import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'aliarkhamnight2019@gmail.com';
const TEST_PASSWORD = 'abcdefghi';

test.describe('Authentication Flow', () => {
  test('should allow user to sign in with existing account', async ({ page }) => {
    await page.goto('/login');
    
    // Ensure we are in Sign In mode
    const heading = await page.getByRole('heading', { name: 'Welcome back' });
    if (!(await heading.isVisible())) {
      await page.getByRole('button', { name: 'Sign In' }).click();
    }

    await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Expect to be redirected to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

    // Sign Out
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL('/');
  });

  test('sign up flow (rate limit awareness)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    const email = `test-${Date.now()}@example.com`;
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Check for success OR rate limit
    const successMsg = page.getByText('Check your email for the confirmation link!');
    const rateLimitMsg = page.getByText('email rate limit exceeded');

    await Promise.race([
      expect(successMsg).toBeVisible(),
      expect(rateLimitMsg).toBeVisible()
    ]).catch(() => {
      // If neither is visible, it might be another error
    });

    if (await rateLimitMsg.isVisible()) {
      console.log('Skipping sign up verification due to rate limit.');
    } else {
      await expect(successMsg).toBeVisible();
    }
  });
});
