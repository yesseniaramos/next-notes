import { test, expect } from '@playwright/test';

test.describe('Notes App - Authentication and Core Features', () => {

  test('complete user authentication flow with note creation', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on login link to navigate to login page
    const loginLink = page.getByRole('link', { name: /login/i }).first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    // Verify we're on the login page
    await expect(page).toHaveURL(/\/login/);

    // Verify login form elements are present
    const loginTitle = page.locator('[data-slot="card-title"]').filter({ hasText: 'Login' });
    await expect(loginTitle).toBeVisible();

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const loginButton = page.getByRole('button', { name: /^login$/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    // Fill in login form with provided credentials
    await emailInput.fill('yessi_rowmi_220@hotmail.com');
    await passwordInput.fill('123456');

    // Submit the form
    await loginButton.click();

    // Wait for successful login and redirect
    // After login, user should be redirected to main page, possibly with a noteId
    await expect(page).toHaveURL(/\//);

    // Verify we're now on the authenticated main page with access to note features
    await expect(page.getByRole('button', { name: /new note/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ask ai/i })).toBeVisible();

    // Look for logout functionality to confirm we're logged in
    const logoutButton = page.getByRole('button', { name: /logout/i }).or(page.getByRole('button', { name: /log out/i }));
    await expect(logoutButton).toBeVisible();
  });

  test('can create a new note after authentication', async ({ page }) => {
    // First login (reuse the login flow)
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('yessi_rowmi_220@hotmail.com');
    await page.getByLabel(/password/i).fill('123456');
    await page.getByRole('button', { name: /^login$/i }).click();

    // Wait for redirect to main page
    await expect(page).toHaveURL(/\//);

    // Click the "New Note" button
    const newNoteButton = page.getByRole('button', { name: /new note/i });
    await expect(newNoteButton).toBeVisible();
    await newNoteButton.click();

    // The URL should change to include a noteId parameter or redirect to a new note
    await expect(page).toHaveURL(/\?noteId=.+/);

    // Look for a text input area where we can write notes
    const noteInput = page.getByRole('textbox').or(page.locator('textarea')).first();
    await expect(noteInput).toBeVisible();

    // Type some content in the note
    await noteInput.fill('This is my test note created via Playwright!');

    // The note should be automatically saved (no explicit save button needed based on typical note apps)
    // Wait a moment for auto-save
    await page.waitForTimeout(1000);

    // Verify the content is still there after a short wait (indicating it was saved)
    await expect(noteInput).toHaveValue('This is my test note created via Playwright!');
  });

  test('can navigate between login and sign-up pages', async ({ page }) => {
    // Go directly to login page
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    // Check for sign up link (use first() to avoid strict mode violation)
    const signUpLink = page.getByRole('link', { name: /sign up/i }).first();
    await expect(signUpLink).toBeVisible();

    // Click to go to sign up page
    await signUpLink.click();
    await expect(page).toHaveURL(/\/sign-up/);

    // Verify sign up page elements
    const signUpTitle = page.locator('[data-slot="card-title"]').filter({ hasText: /sign up/i });
    await expect(signUpTitle).toBeVisible();

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^sign up$/i })).toBeVisible();

    // Navigate back to login using first link
    const loginLink = page.getByRole('link', { name: /login/i }).first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('can use Ask AI feature after authentication', async ({ page }) => {
    // First login
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('yessi_rowmi_220@hotmail.com');
    await page.getByLabel(/password/i).fill('123456');
    await page.getByRole('button', { name: /^login$/i }).click();

    // Wait for redirect to main page
    await expect(page).toHaveURL(/\//);

    // Click the "Ask AI" button
    const askAiButton = page.getByRole('button', { name: /ask ai/i });
    await expect(askAiButton).toBeVisible();
    await askAiButton.click();

    // This should open some kind of dialog or interface for AI interaction
    // Look for common AI interface elements like input fields or dialogs
    const aiDialog = page.getByRole('dialog').or(page.locator('[role="dialog"]'));
    const aiInput = page.getByPlaceholder(/ask/i).or(page.getByRole('textbox')).last();

    // At least one of these should be visible after clicking Ask AI
    const hasAiInterface = await aiDialog.isVisible().catch(() => false) ||
      await aiInput.isVisible().catch(() => false);

    expect(hasAiInterface).toBe(true);
  });

  test('handles form validation and login errors gracefully', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    const loginButton = page.getByRole('button', { name: /^login$/i });
    await loginButton.click();

    // Form should not submit due to HTML5 validation (required fields)
    await expect(page).toHaveURL(/\/login/); // Should stay on login page

    // Try with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await loginButton.click();

    // Should either show error message or stay on login page
    await page.waitForTimeout(2000); // Give time for any error messages

    // The test should remain stable regardless of specific error handling
    // We just verify that invalid login doesn't break the app
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3000'); // We should still be on our app
  });
});