const fs = require('fs/promises');
const path = require('path');
const { glob } = require('glob');

async function copyFiles(sourceDir, targetDir, patterns) {
  const fileArrays = await Promise.all(
    patterns.map((pattern) =>
      glob.glob(pattern, { ignore: ['**/*.test.js', '**/*.spec.js'] })
    )
  );
  const files = fileArrays.flat();

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    try {
      await fs.copyFile(sourcePath, targetPath);
      console.log(`Copied ${sourcePath} to ${targetDir}`);
    } catch (err) {
      console.error(`Error copying ${sourcePath}:`, err);
    }
  }
}

function generateManifest(manifestVersion = 3, browser = 'chromium') {
  if (manifestVersion !== 3 && manifestVersion !== 2) {
    throw new Error('Invalid manifest version');
  }
  if (browser !== 'chromium' && browser !== 'firefox') {
    throw new Error('Invalid browser');
  }

  const domain = 'https://www.clickcritters.com';
  const baseCeUrl = `${domain}/clickexchange.php`;

  const baseManifest = {
    "manifest_version": manifestVersion,
    "name": "CC Click Queue",
    "version": "2.2",
    "author": "mandy-h",
    "description": "Adoptable queue for Click Critters Click Exchange",
    "icons": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    },
    "permissions": [
      "storage",
      "contextMenus",
      "scripting",
      "activeTab"
    ],
    [manifestVersion === 2 ? "browser_action" : "action"]: {
      "default_popup": "popup.html"
    },
    "content_scripts": [
      {
        "matches": [
          baseCeUrl
        ],
        "css": [
          "/styles/message.css"
        ],
        "js": [
          "/scripts/modules/Message.js",
          "/scripts/content-scripts/ce-home.js"
        ],
        "run_at": "document_start"
      },
      {
        "matches": [
          `${baseCeUrl}?act=doCE*`
        ],
        "css": [
          "/styles/message.css",
          "/styles/progressBar.css"
        ],
        "js": [
          "/scripts/modules/Message.js",
          "/scripts/content-scripts/ce-do/ce-do.js"
        ],
        "run_at": "document_end"
      },
      {
        "matches": [
          `${baseCeUrl}?act=choose*`
        ],
        "css": [
          "/styles/message.css"
        ],
        "js": [
          "/scripts/modules/Message.js",
          "/scripts/content-scripts/ce-choose-adopt.js"
        ],
        "run_at": "document_start"
      }
    ]
  };

  const manifestV3 = {
    ...baseManifest,
    "host_permissions": [
      `${baseCeUrl}*`
    ],
    "background": {
      "service_worker": "/scripts/extension/background.js"
    },
    "web_accessible_resources": [
      {
        "matches": [
          `${domain}/*`
        ],
        "resources": [
          "/scripts/modules/ExtensionStorage.js",
          "/scripts/content-scripts/ce-do/ce-do-core.js"
        ]
      }
    ],
  };

  const manifestV2 = {
    ...baseManifest,
    "permissions": [
      ...baseManifest.permissions,
      `${baseCeUrl}*`
    ],
    "background": {
      "scripts": ["/scripts/extension/background.js"],
      "persistent": false
    },
  };

  const manifest = manifestVersion === 2 ? manifestV2 : manifestV3;

  if (browser === 'firefox') {
    // Firefox doesn't support background.service_worker in its manfest v3 implementation
    manifest.background = {
      "scripts": ["/scripts/extension/background.js"],
      "persistent": false
    };
    manifest.browser_specific_settings = {
      "gecko": {
        "id": "cc-click-queue@mandy-h"
      }
    };
  }

  return manifest;
}

/**
 * Builds the extension for a specific browser and manifest version.
 * @param {(3|2)} manifestVersion - The manifest version to build for
 * @param {('chromium'|'firefox')} browser - The browser to build for
 */
async function build(manifestVersion, browser) {
  const distDir = `dist-mv${manifestVersion}-${browser}`;

  // Clean dist directory
  await fs.rm(distDir, { recursive: true, force: true });
  console.log(`Cleaned ${distDir} directory`);

  // Create dist directory
  await fs.mkdir(distDir, { recursive: true });

  // File patterns to copy
  const filePatterns = [
    'scripts/**/*.js',
    'styles/**/*.css',
    'icons/**/*',
    '*.html'
  ];

  // Copy files
  await copyFiles('.', distDir, filePatterns);

  // Generate manifest.json
  await fs.writeFile(
    path.join(distDir, 'manifest.json'),
    JSON.stringify(generateManifest(manifestVersion, browser), null, 2)
  );
  console.log(`Created ${path.join(distDir, 'manifest.json')}`);
}

async function buildAll() {
  const builds = [
    { manifestVersion: 3, browser: 'chromium' },
    { manifestVersion: 3, browser: 'firefox' },
    { manifestVersion: 2, browser: 'firefox' },
  ];

  try {
    for (const buildConfig of builds) {
      await build(buildConfig.manifestVersion, buildConfig.browser);
      console.log('\n');
    }

    console.log('Build completed successfully!');
  } catch (err) {
    console.log('\n');
    console.error('Build failed:', err);
    process.exit(1);
  }
}

buildAll(); 