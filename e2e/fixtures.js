import { test as base, chromium } from '@playwright/test';
import path from 'path';

export const test = base.extend({
  context: async ({ }, use) => {
    const pathToExtension = path.join(__dirname, '../');
    /**
     * Playwright currently only supports extensions in Chrome/Chromium.
     * See https://playwright.dev/docs/chrome-extensions
     */
    const context = await chromium.launchPersistentContext('', {
      baseURL: pathToExtension,
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  backgroundPage: async ({ context }, use) => {
    // for manifest v2:
    // let [background] = context.backgroundPages();
    // if (!background) {
    //   background = await context.waitForEvent('backgroundpage');
    // }

    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    await use(background);
  },
  extensionId: async ({ backgroundPage }, use) => {
    const extensionId = backgroundPage.url().split('/')[2];
    await use(extensionId);
  },
});

export const expect = test.expect;