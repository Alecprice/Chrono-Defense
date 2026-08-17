import { readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = new URL('../dist/', import.meta.url);
const rootPath = root.pathname;

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
  .filter(path => path !== '/precache-manifest.json' && path !== '/sw.js')
  .sort();

await writeFile(join(rootPath, 'precache-manifest.json'), JSON.stringify(files));
console.log(`Generated precache manifest with ${files.length} files.`);
