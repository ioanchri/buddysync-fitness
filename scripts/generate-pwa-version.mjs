import { readFile, writeFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const output = `const BUDDYSYNC_BUILD_VERSION = '${packageJson.version}';\n`;

await writeFile(new URL('../public/pwa-version.js', import.meta.url), output);