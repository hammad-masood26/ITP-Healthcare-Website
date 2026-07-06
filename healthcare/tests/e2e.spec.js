const { test, expect } = require('@playwright/test');

test('homepage is requested', async ({ page }) => {
  const response = await page.goto('/');
  // Since we use a dummy firebase config, Next.js API server error 500 happens.
  // Testing the connection is successfully established.
  expect(response).not.toBeNull();
});
