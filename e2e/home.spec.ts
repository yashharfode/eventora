import { test, expect } from '@playwright/test';
test('homepage explains EVENTORA and links to the workspace', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Big moments deserve brilliant planning/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Plan an event/i })).toHaveAttribute('href', '/dashboard');
});
