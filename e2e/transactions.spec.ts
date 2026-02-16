import { test, expect, type Page } from '@playwright/test';

const TEST_EMAIL = 'aliarkhamnight2019@gmail.com';
const TEST_PASSWORD = 'abcdefghi';

async function signIn(page: Page) {
  await page.goto('/login');
  
  // Toggle to sign in if needed
  const isSignInVisible = await page.getByRole('heading', { name: 'Welcome back' }).isVisible();
  if (!isSignInVisible) {
    await page.getByRole('button', { name: 'Sign In' }).click();
  }

  await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
}

test.describe('Transaction Flow', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('should allow user to add a new expense transaction', async ({ page }) => {
    await page.goto('/dashboard/transactions');
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();

    const amount = '50.25';
    const description = `Test Expense ${Date.now()}`;

    // Fill the add transaction form
    await page.getByPlaceholder('0.00').fill(amount);
    await page.getByPlaceholder('e.g. Weekly Groceries').fill(description);
    await page.getByRole('combobox', { name: 'Type' }).selectOption('expense');
    // We assume 'Food & Dining' exists (it's in the default setup sql)
    await page.getByRole('combobox', { name: 'Category' }).selectOption({ label: 'Food & Dining' });
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    // Expect the new transaction to appear in the list
    await expect(page.getByText(description)).toBeVisible();
    // The UI shows -$50.25
    await expect(page.getByText(`-$${amount}`)).toBeVisible();
  });

  test('should allow user to add a new income transaction', async ({ page }) => {
    await page.goto('/dashboard/transactions');
    
    const amount = '1000';
    const description = `Test Income ${Date.now()}`;

    await page.getByPlaceholder('0.00').fill(amount);
    await page.getByPlaceholder('e.g. Weekly Groceries').fill(description);
    await page.getByRole('combobox', { name: 'Type' }).selectOption('income');
    await page.getByRole('combobox', { name: 'Category' }).selectOption({ label: 'Salary' });
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    await expect(page.getByText(description)).toBeVisible();
    await expect(page.getByText('+$1,000')).toBeVisible();
  });
});
