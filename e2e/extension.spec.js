import { test, expect } from './fixtures.js';
import path from 'path';

test.describe('Tests for queue page loading', () => {
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

    // Set up test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    // Check that the queue has one item
    await expect(page.locator('.queue-item')).toHaveCount(1);
  });
});

test.describe('Tests for queue page interactions', () => {
  test('Sort All button', async ({ page, extensionId, backgroundPage }) => {
    const testData = {
      queue: [
        {
          id: '1',
          target: 100,
        },
        {
          id: '2',
          target: 200,
        },
        {
          id: '3',
          target: 30,
        },
      ],
    };

    // Set up test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    // Open the sort modal and interact with the form
    await page.locator('#js-btn--sort-all').click();
    await page.locator('#js-sort-all-form input[name="param"][value="target"]').click();
    await page.locator('#js-sort-all-form input[name="order"][value="ascending"]').click();
    await page.locator('#js-sort-all-form__submit').click();

    const sortedLevels = await page.locator('.queue-item').evaluateAll((items) => {
      return items.map((item) => item.dataset.target);
    });

    // Check that the queue was sorted by target level in ascending order
    await expect(sortedLevels).toEqual(['30', '100', '200']);

    // Interact with the form again
    await page.locator('#js-sort-all-form input[name="param"][value="id"]').click();
    await page.locator('#js-sort-all-form input[name="order"][value="descending"]').click();
    await page.locator('#js-sort-all-form__submit').click();

    const sortedIds = await page.locator('.queue-item').evaluateAll((items) => {
      return items.map((item) => item.dataset.id);
    });

    // Check that the queue was sorted by id in descending order
    await expect(sortedIds).toEqual(['3', '2', '1']);
  });

  test('Edit All button', async ({ page, extensionId, backgroundPage }) => {
    const testData = {
      queue: [
        {
          id: '1',
          target: 100,
        },
        {
          id: '2',
          target: 200,
        },
        {
          id: '3',
          target: 30,
        },
      ],
    };

    // Set up test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    // Open the edit modal and interact with the form
    await page.locator('#js-btn--edit-all').click();
    await page.locator('#js-edit-all-form input[name="target"]').fill('150');
    await page.locator('#js-edit-all-form__submit').click();

    const updatedLevels = await page.locator('.queue-item').evaluateAll((items) => {
      return items.map((item) => item.dataset.target);
    });

    // Check that all items in the queue were updated with the new target level
    await expect(updatedLevels).toEqual(['150', '150', '150']);
  });

  test('List/Grid layout buttons', async ({ page, extensionId, backgroundPage }) => {
    const testData = {
      queue: [
        {
          id: '1',
          target: 100,
        },
        {
          id: '2',
          target: 200,
        },
        {
          id: '3',
          target: 30,
        },
      ],
    };

    // Set up test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    // Test grid view
    await page.locator('#js-btn--grid-view').click();
    await expect(page.locator('#js-queue')).toHaveClass(/(^|\s)grid(\s|$)/);

    // Test list view
    await page.locator('#js-btn--list-view').click();
    await expect(page.locator('#js-queue')).toHaveClass(/(^|\s)list(\s|$)/);
  });

  test('Clear Queue button', async ({ page, extensionId, backgroundPage }) => {
    const testData = {
      queue: [
        {
          id: '1',
          target: 100,
        },
        {
          id: '2',
          target: 200,
        },
        {
          id: '3',
          target: 30,
        },
      ],
    };

    // Set up test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    // Click on the Clear Queue button and confirm the dialog
    page.on('dialog', dialog => dialog.accept());
    await page.locator('#js-btn--clear-queue').click();

    // Check that the queue is empty
    await expect(page.locator('.queue-item')).toHaveCount(0);
  });

  test('Start Queue button', async ({ page, extensionId, backgroundPage }) => {
    const testData = {
      queue: [
        {
          id: '15522329',
          target: 100,
        },
        {
          id: '15522150',
          target: 100,
        },
      ],
    };

    // Set up test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    // Click the Start Queue button and wait for the new tab to load
    await page.locator('#js-btn--start-queue').click();
    const newTab = await page.waitForEvent('popup');
    await newTab.waitForLoadState();

    // Check that the browser navigated to the CE page with the first adoptable active
    await expect(newTab).toHaveURL(/.*\?act=choose&adoptID=15522329/);
  });

  test('Edit target level for a single adoptable', async ({ page, extensionId, backgroundPage }) => {
    const testData = {
      queue: [
        {
          id: '1',
          target: 100,
        },
      ],
    };

    // Set up test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    const queueItem = page.locator('.queue-item');

    // Click on the target level and edit it
    await queueItem.locator('.js-item-action--edit').click();
    await queueItem.locator('.js-target-edit').fill('150');
    await page.keyboard.press('Enter');

    // Check that the target level was updated
    await expect(queueItem.locator('.queue-item__target')).toHaveText('150');
  });

  test('Move adoptable to the beginning and end of queue', async ({ page, extensionId, backgroundPage }) => {
    const testData = {
      queue: [
        {
          id: '1',
          target: 100,
        },
        {
          id: '2',
          target: 200,
        },
        {
          id: '3',
          target: 30,
        },
      ],
    };

    // Set up test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    const queueItem = page.locator('.queue-item[data-id="2"]');

    // Move to the beginning of the queue
    await queueItem.locator('.js-item-actions-toggle').click();
    await queueItem.locator('.js-item-action--move-front').click();

    // Check that the adoptable is now the first item in the queue
    expect(page.locator('.queue-item').first()).toHaveAttribute('data-id', '2');

    // Move to the end of the queue
    await queueItem.locator('.js-item-actions-toggle').click();
    await queueItem.locator('.js-item-action--move-end').click();

    // Check that the adoptable is now the last item in the queue
    expect(page.locator('.queue-item').last()).toHaveAttribute('data-id', '2');
  });

  test('Delete a single adoptable', async ({ page, extensionId, backgroundPage }) => {
    const testData = {
      queue: [
        {
          id: '1',
          target: 100,
        },
        {
          id: '2',
          target: 200,
        },
      ],
    };

    // Set up test data
    await backgroundPage.evaluate(async (data) => {
      await chrome.storage.local.set(data);
    }, testData);

    // Load the queue page
    await page.goto(`chrome-extension://${extensionId}/queue.html`);

    const queueItem = page.locator('.queue-item[data-id="2"]');

    // Delete the adoptable by clicking the delete button
    await queueItem.locator('.js-item-actions-toggle').click();
    await queueItem.locator('.js-item-action--delete').click();

    // Check that the adoptable is no longer in the queue
    await expect(page.locator('.queue-item')).toHaveCount(1);
    await expect(page.locator('.queue-item[data-id="2"]')).toHaveCount(0);
  });
});

test.describe('Tests for test pages', () => {
  test('The increment button increments the level', async ({ page }) => {
    await page.goto(`file:${path.join(__dirname, './test-pages/clickexchange-do.html')}`);

    const extensionButton = page.locator('#increment-button');
    await extensionButton.click();

    await expect(page.getByTestId('total')).toHaveText('2');
  });
});