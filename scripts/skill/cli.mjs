#!/usr/bin/env node
import { access, cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const usage =
  'Usage: avinlab-form install-skills [--target <directory>]\nDefault target: .agents/skills in the current project.';
const args = process.argv.slice(2);

async function main() {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(usage);
    return;
  }
  const validTarget = args.length === 3 && args[1] === '--target' && args[2] && !args[2].startsWith('--');
  if (args[0] !== 'install-skills' || (args.length !== 1 && !validTarget)) {
    throw new Error(usage);
  }
  const target = path.resolve(args[2] ?? '.agents/skills');
  const source = fileURLToPath(new URL('../skills/', import.meta.url));
  const names = ['avinlab-form'];
  for (const name of names) {
    try {
      await access(path.join(target, name));
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    throw new Error(`Skill already exists: ${path.join(target, name)}. Move or remove it before installing.`);
  }
  await mkdir(target, { recursive: true });
  for (const name of names) {
    await cp(path.join(source, name), path.join(target, name), {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  }
  console.log(`Installed ${names.join(' and ')} into ${target}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
