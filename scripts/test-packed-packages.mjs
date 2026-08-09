import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryBase = path.join(repositoryRoot, '.tmp');
const fixtureDirectory = path.join(repositoryRoot, 'scripts/packed-consumer');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const packages = [
  {
    directory: 'packages/form',
    name: '@avinlab/form',
    repositoryDirectory: 'packages/form',
  },
  {
    directory: 'packages/react-form',
    name: '@avinlab/react-form',
    repositoryDirectory: 'packages/react-form',
  },
];
const expectedPackageFiles = [
  'LICENSE',
  'README.md',
  'dist/index.cjs',
  'dist/index.cjs.map',
  'dist/index.d.cts',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/index.js.map',
  'package.json',
];
const fixtureFiles = [
  'commonjs-smoke.cjs',
  'consumer-contract.cts',
  'consumer-contract.mts',
  'consumer-contract.ts',
  'esm-smoke.mjs',
  'react-contract.mjs',
  'tsconfig.bundler.json',
  'tsconfig.nodenext.json',
];

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(
      [`Command failed: ${command} ${args.join(' ')}`, result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n'),
    );
  }

  return result.stdout.trim();
};

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));
const asFileDependency = (fromDirectory, filePath) =>
  `file:${path.relative(fromDirectory, filePath).replaceAll(path.sep, '/')}`;

await mkdir(temporaryBase, { recursive: true });
const temporaryRoot = await mkdtemp(path.join(temporaryBase, 'packed-consumers-'));

try {
  const tarballDirectory = path.join(temporaryRoot, 'tarballs');
  const consumerDirectory = path.join(temporaryRoot, 'consumer');
  await mkdir(tarballDirectory, { recursive: true });
  await mkdir(consumerDirectory, { recursive: true });

  const tarballs = new Map();

  for (const packageDefinition of packages) {
    const packageDirectory = path.join(repositoryRoot, packageDefinition.directory);
    const manifest = await readJson(path.join(packageDirectory, 'package.json'));

    assert.equal(manifest.name, packageDefinition.name);
    assert.ok(manifest.description, `${manifest.name} must have a description`);
    assert.equal(manifest.license, 'MIT');
    assert.deepEqual(manifest.repository, {
      type: 'git',
      url: 'git+https://github.com/avin/avinlab-form.git',
      directory: packageDefinition.repositoryDirectory,
    });
    assert.equal(manifest.homepage, 'https://github.com/avin/avinlab-form#readme');
    assert.equal(manifest.bugs?.url, 'https://github.com/avin/avinlab-form/issues');
    assert.deepEqual([...manifest.files].sort(), ['LICENSE', 'README.md', 'dist']);
    assert.deepEqual(Object.keys(manifest.exports).sort(), ['.', './package.json']);

    if (manifest.name === '@avinlab/react-form') {
      assert.equal(manifest.peerDependencies.react, '>=17.0.0');
      assert.equal(manifest.peerDependencies['react-dom'], '>=17.0.0');
      assert.equal(manifest.peerDependenciesMeta['react-dom'].optional, true);
      assert.equal(manifest.peerDependenciesMeta['react-native'].optional, true);
    }

    const packOutput = run(
      npmCommand,
      ['pack', packageDirectory, '--json', '--pack-destination', tarballDirectory],
      repositoryRoot,
    );
    const [packResult] = JSON.parse(packOutput);
    const packedFiles = packResult.files.map(({ path: filePath }) => filePath).sort();

    assert.deepEqual(
      packedFiles,
      expectedPackageFiles,
      `${manifest.name} tarball must contain only the declared public entry point and package docs`,
    );
    tarballs.set(manifest.name, path.join(tarballDirectory, packResult.filename));
  }

  const consumerManifest = {
    name: 'avinlab-form-packed-consumer',
    private: true,
    type: 'module',
    dependencies: {
      '@avinlab/form': asFileDependency(consumerDirectory, tarballs.get('@avinlab/form')),
      '@avinlab/react-form': asFileDependency(
        consumerDirectory,
        tarballs.get('@avinlab/react-form'),
      ),
      '@types/react': '18.2.35',
      '@types/react-dom': '18.2.14',
      jsdom: '22.1.0',
      react: '18.2.0',
      'react-dom': '18.2.0',
    },
  };
  await writeFile(
    path.join(consumerDirectory, 'package.json'),
    `${JSON.stringify(consumerManifest, null, 2)}\n`,
  );
  run(
    npmCommand,
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock'],
    consumerDirectory,
  );

  for (const packageDefinition of packages) {
    const installedPackageDirectory = path.join(
      consumerDirectory,
      'node_modules',
      ...packageDefinition.name.split('/'),
    );
    const installedPackage = await lstat(installedPackageDirectory);
    assert.equal(
      installedPackage.isSymbolicLink(),
      false,
      `${packageDefinition.name} must come from its tarball, not workspace source`,
    );
  }

  await Promise.all(
    fixtureFiles.map((fixtureFile) =>
      copyFile(path.join(fixtureDirectory, fixtureFile), path.join(consumerDirectory, fixtureFile)),
    ),
  );
  run(process.execPath, ['esm-smoke.mjs'], consumerDirectory);
  run(process.execPath, ['commonjs-smoke.cjs'], consumerDirectory);

  const typeScriptCompiler = path.join(repositoryRoot, 'node_modules/typescript/bin/tsc');
  run(process.execPath, [typeScriptCompiler, '-p', 'tsconfig.nodenext.json'], consumerDirectory);
  run(process.execPath, [typeScriptCompiler, '-p', 'tsconfig.bundler.json'], consumerDirectory);

  run(process.execPath, ['react-contract.mjs'], consumerDirectory);

  process.stdout.write('Packed package consumer checks passed.\n');
} finally {
  assert.equal(path.dirname(path.resolve(temporaryRoot)), path.resolve(temporaryBase));
  assert.ok(path.basename(temporaryRoot).startsWith('packed-consumers-'));
  await rm(temporaryRoot, { recursive: true, force: true });
}
