import { test, expect } from '@playwright/test';

/**
 * Smoke tests for basic application functionality
 * These tests verify the app loads correctly and core UI elements are present
 */

test.describe('Smoke Tests', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Verify page title/heading
    await expect(page.getByText('Integration sync')).toBeVisible();
  });

  test('displays integrations list', async ({ page }) => {
    await page.goto('/');
    
    // Verify Integrations section header
    await expect(page.getByText('Integrations')).toBeVisible();
    
    // Verify all mock integrations are displayed
    await expect(page.getByText('Salesforce')).toBeVisible();
    await expect(page.getByText('HubSpot')).toBeVisible();
    await expect(page.getByText('Stripe')).toBeVisible();
    await expect(page.getByText('Slack')).toBeVisible();
  });

  test('displays integration details', async ({ page }) => {
    await page.goto('/');
    
    // Salesforce is selected by default
    await expect(page.getByText('Salesforce', { exact: false }).first()).toBeVisible();
    
    // Verify sync button is present
    await expect(page.getByRole('button', { name: /Sync now/i })).toBeVisible();
    
    // Verify status badges are displayed
    await expect(page.getByText('Conflict')).toBeVisible();
    await expect(page.getByText('Synced')).toBeVisible();
    await expect(page.getByText('Syncing')).toBeVisible();
    await expect(page.getByText('Error')).toBeVisible();
  });

  test('can select different integration', async ({ page }) => {
    await page.goto('/');
    
    // Click on HubSpot
    await page.getByText('HubSpot').click();
    
    // Verify HubSpot details are shown in the right panel
    await expect(page.locator('text=HubSpot').nth(1)).toBeVisible();
    
    // Verify the selected item has visual indication
    const hubspotCard = page.getByText('HubSpot').locator('..').locator('..');
    await expect(hubspotCard).toHaveCSS('background-color', /rgba\(0, 0, 0, 0\.04\)/);
  });

  test('displays sync history', async ({ page }) => {
    await page.goto('/');
    
    // Verify Sync History section
    await expect(page.getByText('Sync History')).toBeVisible();
    
    // Verify history items from mock data
    await expect(page.getByText(/2 conflicts detected/)).toBeVisible();
    await expect(page.getByText(/Synced 3 fields successfully/)).toBeVisible();
    await expect(page.getByText(/Full sync completed/)).toBeVisible();
  });

  test('sync button respects integration state', async ({ page }) => {
    await page.goto('/');
    
    // Salesforce has conflict status - verify Sync now button is enabled
    const syncButton = page.getByRole('button', { name: /Sync now/i });
    await expect(syncButton).toBeEnabled();
    
    // Click on Stripe which has syncing status
    await page.getByText('Stripe').click();
    
    // The button should show the syncing state
    await expect(page.getByText('Syncing...')).toBeVisible();
  });
});
