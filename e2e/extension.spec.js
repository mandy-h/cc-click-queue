import { test, expect } from './fixtures.js';
import path from 'path';

test.describe('Tests for queue page', () => {
  test('Loads an empty queue by default', async ({ page, extensionId }) => {
    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    // Check that the queue is empty
    await expect(page.locator('.queue-item')).toHaveCount(0);
  });

  test('Loads a non-empty queue', async ({ page, extensionId, backgroundPage }) => {
    const testData = {
      queue: [
        {
          id: '1',
          target: 30,
        },
      ],
      view: 'list',
    };
    // Setup test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    // Check that the queue has one item
    await expect(page.locator('.queue-item')).toHaveCount(1);
  });
});

test.describe('Tests for test pages', () => {
  test('The increment button increments the level', async ({ page }) => {
    await page.goto(`file:${path.join(__dirname, './test-pages/clickexchange-do.html')}`);

    const extensionButton = page.locator('#increment-button');
    await extensionButton.click();

    expect(page.getByTestId('total')).toHaveText('2');
  });
});