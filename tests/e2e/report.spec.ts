import { test, expect } from '@playwright/test';

test('public report renders key sections', async ({ page }) => {
  await page.goto('/reports/demo');
  await expect(page.getByRole('heading', { name: /Audit Card/i })).toBeVisible();
  await expect(page.getByText(/Variance/i)).toBeVisible();
  await expect(page.getByText(/Download PDF/i)).toBeVisible();
});
