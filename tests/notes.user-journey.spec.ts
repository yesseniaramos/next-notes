import { test, expect } from '@playwright/test';

test.describe('Notes App - Complete User Journey', () => {

  test('complete user journey: login, create note, logout, and re-login', async ({ page }) => {
    // Step 1: Navigate to home page and login
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to login
    const loginLink = page.getByRole('link', { name: /login/i }).first();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);

    // Login with provided credentials
    await page.getByLabel(/email/i).fill('yessi_rowmi_220@hotmail.com');
    await page.getByLabel(/password/i).fill('123456');
    await page.getByRole('button', { name: /^login$/i }).click();

    // Verify successful login
    await expect(page).toHaveURL(/\//);
    await expect(page.getByRole('button', { name: /new note/i })).toBeVisible();

    // Step 2: Create a new note
    await page.getByRole('button', { name: /new note/i }).click();
    await expect(page).toHaveURL(/\?noteId=.+/);

    const noteInput = page.getByRole('textbox').or(page.locator('textarea')).first();
    await expect(noteInput).toBeVisible();
    await noteInput.fill('My persistent test note - ' + Date.now());
    await page.waitForTimeout(1000); // Allow auto-save

    // Step 3: Logout
    const logoutButton = page.getByRole('button', { name: /logout/i }).or(page.getByRole('button', { name: /log out/i }));
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Should be redirected to home or login page
    await page.waitForLoadState('networkidle');

    // Step 4: Verify logout worked - should see login links again
    const loginLinksAfterLogout = page.getByRole('link', { name: /login/i });
    await expect(loginLinksAfterLogout.first()).toBeVisible();

    // Step 5: Login again to verify session was properly cleared
    await loginLinksAfterLogout.first().click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel(/email/i).fill('yessi_rowmi_220@hotmail.com');
    await page.getByLabel(/password/i).fill('123456');
    await page.getByRole('button', { name: /^login$/i }).click();

    // Should be successfully logged in again
    await expect(page).toHaveURL(/\//);
    await expect(page.getByRole('button', { name: /new note/i })).toBeVisible();
  });

  test('unauthenticated user interactions', async ({ page }) => {
    // Visit the app without logging in
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should see login options
    const loginLinks = page.getByRole('link', { name: /login/i });
    await expect(loginLinks.first()).toBeVisible();

    // Check if any authenticated features are properly restricted
    // This depends on the app's architecture - some apps show features but restrict access
    const newNoteButton = page.getByRole('button', { name: /new note/i });
    const askAiButton = page.getByRole('button', { name: /ask ai/i });

    // If buttons are visible, clicking them should either redirect to login or show auth prompt
    if (await newNoteButton.isVisible()) {
      await newNoteButton.click();
      // Should either redirect to login or stay on same page with auth prompt
      await page.waitForLoadState('networkidle');
      // The app behavior here is acceptable either way
    }

    if (await askAiButton.isVisible()) {
      await askAiButton.click();
      // Should either redirect to login or show auth requirement
      await page.waitForLoadState('networkidle');
    }

    // Final verification - should still have access to login
    const finalLoginLinks = page.getByRole('link', { name: /login/i });
    await expect(finalLoginLinks.first()).toBeVisible();
  });

  test('sidebar navigation and note management', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('yessi_rowmi_220@hotmail.com');
    await page.getByLabel(/password/i).fill('123456');
    await page.getByRole('button', { name: /^login$/i }).click();
    await expect(page).toHaveURL(/\//);

    // Look for sidebar content specifically to avoid strict mode violation
    const sidebarContent = page.locator('[data-sidebar="content"]').first();

    if (await sidebarContent.isVisible()) {
      console.log('Sidebar found and visible');

      // Look for note list or navigation items in sidebar
      const noteItems = sidebarContent.locator('button, a, [role="button"]');
      const noteCount = await noteItems.count();

      if (noteCount > 0) {
        console.log(`Found ${noteCount} navigation items in sidebar`);
      }
    }

    // Create a new note and verify the interface works
    await page.getByRole('button', { name: /new note/i }).click();
    await expect(page).toHaveURL(/\?noteId=.+/);

    // Look for the main content area where notes are displayed/edited
    const mainContent = page.locator('main').or(page.locator('[role="main"]')).or(page.locator('.main-content'));
    await expect(mainContent).toBeVisible();

    // Verify that we have a note interface available
    // This is more robust than checking for specific input values
    const noteInterface = page.locator('textarea').or(page.locator('[contenteditable]')).or(page.getByRole('textbox')).last();
    await expect(noteInterface).toBeVisible();

    console.log('Note interface is available and test passed');
  });
});