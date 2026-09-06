import { readFile, writeFile, readdir } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

const source = new URL('./source/', import.meta.url);
const output = new URL('./assets/', import.meta.url);
for (const name of await readdir(source)) {
  if (!name.endsWith('.ts')) continue;
  const code = await readFile(new URL(name, source), 'utf8');
  const result = stripTypeScriptTypes(code, { mode: 'strip' }).replace(/from (['"])(\.\/[^'"]+)\.ts\1/g, 'from $1$2.mjs$1');
  await writeFile(new URL(name.replace(/\.ts$/, '.mjs'), output), result);
}
