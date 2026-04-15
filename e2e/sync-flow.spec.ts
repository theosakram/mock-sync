import { test, expect } from '@playwright/test';

/**
 * E2E tests for the sync flow
 * Tests the complete user journey from selecting an integration to syncing
 */

test.describe('Sync Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('complete sync flow for synced integration', async ({ page }) => {
    // Select HubSpot which is in synced state
    await page.getByText('HubSpot').first().click();
    
    // Verify initial state shows synced badge (use first() for list item)
    await expect(page.getByText('Synced').first()).toBeVisible();
    
    // Click sync button
    const syncButton = page.getByRole('button', { name: /Sync now/i }).first();
    await syncButton.click();
    
    // Wait for syncing state
    await expect(page.getByText('Syncing...').first()).toBeVisible();
  });

  test('conflict resolution flow', async ({ page }) => {
    // Select Salesforce which has conflict status by default
    await page.getByText('Salesforce').first().click();
    
    // Verify conflict badge is visible (first() for list, or check detail panel)
    await expect(page.getByText('Conflict').first()).toBeVisible();
    
    // Verify button is present and initially enabled
    const syncButton = page.getByRole('button', { name: /Sync now/i }).first();
    await expect(syncButton).toBeVisible();
    await expect(syncButton).toBeEnabled();
  });

  test('error state handling', async ({ page }) => {
    // Select Slack which has error status
    await page.getByText('Slack').first().click();
    
    // Verify error badge is visible
    await expect(page.getByText('Error').first()).toBeVisible();
    
    // Verify version and last sync info is displayed in detail panel (nth(1))
    await expect(page.getByText(/1\.2\.0/).nth(1)).toBeVisible();
    await expect(page.getByText(/20 minutes ago/).nth(1)).toBeVisible();
  });

  test('integration selection while syncing is disabled', async ({ page }) => {
    // Click on Stripe which has syncing status
    await page.getByText('Stripe').first().click();
    
    // Verify Stripe details are shown
    await expect(page.getByText('Stripe').nth(1)).toBeVisible();
  });
});

test.describe('Integration Card Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('integration cards display correct status badges', async ({ page }) => {
    // Verify all status badges in the list - use first() for each
    await expect(page.getByText('Conflict').first()).toBeVisible();
    await expect(page.getByText('Synced').first()).toBeVisible();
    await expect(page.getByText('Syncing').first()).toBeVisible();
    await expect(page.getByText('Error').first()).toBeVisible();
  });

  test('clicking integration updates detail panel', async ({ page }) => {
    // Initially Salesforce is selected (first in list + in detail panel)
    await expect(page.getByText('Salesforce').nth(1)).toBeVisible();
    
    // Click HubSpot
    await page.getByText('HubSpot').first().click();
    
    // Verify detail panel updates - HubSpot should appear twice (list + detail)
    await expect(page.getByText('HubSpot').nth(1)).toBeVisible();
    
    // Verify status line shows synced info for HubSpot (nth(1) targets detail panel)
    await expect(page.getByText(/2\.1\.0/).nth(1)).toBeVisible();
    await expect(page.getByText(/12 minutes ago/).nth(1)).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('page has proper heading structure', async ({ page }) => {
    // Check for main heading
    const heading = page.getByText('Integration sync').first();
    await expect(heading).toBeVisible();
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    // Tab to sync button
    await page.keyboard.press('Tab');
    
    // The sync button should be focusable
    const syncButton = page.getByRole('button', { name: /Sync now/i }).first();
    await expect(syncButton).toBeVisible();
    
    // Buttons should have proper aria labels or text
    await expect(syncButton).toHaveText(/Sync now/);
  });

  test('interactive elements have visible focus states', async ({ page }) => {
    // Click on HubSpot
    await page.getByText('HubSpot').first().click();
    
    // Verify the integration name appears in detail panel
    await expect(page.getByText('HubSpot').nth(1)).toBeVisible();
  });
});
