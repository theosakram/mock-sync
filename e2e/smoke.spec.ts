import { test, expect } from '@playwright/test';

/**
 * Smoke tests for basic application functionality
 * These tests verify the app loads correctly and core UI elements are present
 */

test.describe('Smoke Tests', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Verify page title/heading
    await expect(page.getByText('Integration sync').first()).toBeVisible();
  });

  test('displays integrations list', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Verify Integrations section header
    await expect(page.getByText('Integrations').first()).toBeVisible();
    
    // Verify all mock integrations are displayed - use first() to target list items
    await expect(page.getByText('Salesforce').first()).toBeVisible();
    await expect(page.getByText('HubSpot').first()).toBeVisible();
    await expect(page.getByText('Stripe').first()).toBeVisible();
    await expect(page.getByText('Slack').first()).toBeVisible();
  });

  test('displays integration details', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Salesforce is selected by default - check in detail panel (nth(1))
    await expect(page.getByText('Salesforce').nth(1)).toBeVisible();
    
    // Verify sync button is present
    await expect(page.getByRole('button', { name: /Sync now/i }).first()).toBeVisible();
    
    // Verify status badges are displayed in the list section only
    // Use filter to target only the list area
    const badges = page.locator('span[class*="chakra-badge"]').filter({ hasText: 'Conflict' });
    await expect(badges.first()).toBeVisible();
  });

  test('can select different integration', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Click on HubSpot - use first() to target the list item
    await page.getByText('HubSpot').first().click();
    
    // Verify HubSpot details are shown in the right panel (nth(1) = second occurrence)
    await expect(page.getByText('HubSpot').nth(1)).toBeVisible();
    
    // Verify version info appears in detail panel (nth(1))
    await expect(page.getByText(/2\.1\.0/).nth(1)).toBeVisible();
  });

  test('displays sync history', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Verify history items from mock data using regex patterns
    await expect(page.getByText(/conflicts? detected/).first()).toBeVisible();
    await expect(page.getByText(/Synced \d+ fields/).first()).toBeVisible();
    await expect(page.getByText(/Full sync completed/).first()).toBeVisible();
  });

  test('sync button respects integration state', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Salesforce has conflict status - verify Sync now button is enabled
    const syncButton = page.getByRole('button', { name: /Sync now/i }).first();
    await expect(syncButton).toBeEnabled();
    
    // Click on Stripe which has syncing status
    await page.getByText('Stripe').first().click();
    
    // The status badge should be visible (not the button loading state)
    await expect(page.getByText('Syncing').first()).toBeVisible();
  });
});
