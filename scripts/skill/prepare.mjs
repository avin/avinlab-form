// Copies the shared agent skill and installer CLI into a package before it is packed.
// Usage: node ../../scripts/skill/prepare.mjs (run from a package directory).
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const pkg = process.cwd();

await rm(path.join(pkg, 'skills'), { recursive: true, force: true });
await rm(path.join(pkg, 'bin'), { recursive: true, force: true });
await cp(path.join(root, 'skills'), path.join(pkg, 'skills'), { recursive: true });
await mkdir(path.join(pkg, 'bin'), { recursive: true });
await cp(path.join(here, 'cli.mjs'), path.join(pkg, 'bin/avinlab-form.mjs'));
