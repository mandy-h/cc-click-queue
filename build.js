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
      console.log(`Copied: ${file}`);
    } catch (err) {
      console.error(`Error copying ${file}:`, err);
    }
  }
}

async function build(manifestFile, distDir) {
  // Clean dist directory
  try {
    await fs.rm(distDir, { recursive: true, force: true });
    console.log(`Cleaned ${distDir} directory`);
  } catch (err) {
    // Directory doesn't exist
  }

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

  // Copy and rename manifest
  const manifestContent = await fs.readFile(manifestFile, 'utf-8');
  await fs.writeFile(path.join(distDir, 'manifest.json'), manifestContent);
  console.log(`Created manifest.json (${manifestFile})`);
}

async function buildAll() {
  try {
    // Build with v3 manifest
    await build('manifest.json', 'dist');
    console.log('\n');
    // Build with FF-compatible v3 manifest
    await build('manifest-ff.json', 'dist-ff');
    console.log('\n');
    console.log('Build completed successfully!');
  } catch (err) {
    console.log('\n');
    console.error('Build failed:', err);
    process.exit(1);
  }
}

buildAll(); 