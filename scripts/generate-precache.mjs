import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = new URL('../dist/', import.meta.url);
const rootPath = root.pathname;
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const buildInfo = {
  service: 'chrono-defense',
  version: packageJson.version,
  commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.COMMIT_REF || null,
  branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || process.env.BRANCH || null,
};

await writeFile(join(rootPath, 'build-info.json'), `${JSON.stringify(buildInfo)}\n`);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const files = (await walk(rootPath))
  .map(file => '/' + relative(rootPath, file).split(sep).join('/'))
  .filter(path => !['/precache-manifest.json', '/sw.js', '/build-info.json'].includes(path))
  .sort();

await writeFile(join(rootPath, 'precache-manifest.json'), JSON.stringify(files));
console.log(`Generated precache manifest with ${files.length} files.`);
console.log(`Build identity: ${buildInfo.commit || 'local'} · ${buildInfo.version}`);
