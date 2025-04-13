import { test, expect } from '@playwright/test';

test('loads markdown editor UI', async ({ page }) =>
{
    await page.goto('http://localhost:3100');
    await expect(page.locator('h1')).toHaveText('Markdown Editor');
    await expect(page.locator('#category-select')).toBeVisible();
    await expect(page.locator('#file-list')).toBeVisible();
});