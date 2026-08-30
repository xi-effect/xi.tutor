#!/usr/bin/env node
/**
 * Collects signed Tauri updater bundles into a static CDN layout and writes
 * `latest.json` for `@tauri-apps/plugin-updater`.
 *
 *   node make-updater-manifest.mjs \
 *     --dir ./artifacts \
 *     --version 0.1.0 \
 *     --base-url https://releases.sovlium.ru/desktop \
 *     --out ./publish \
 *     --notes "Bug fixes"
 */

import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

function arg(name, fallback = '') {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

function readSig(bundlePath) {
  const sigPath = `${bundlePath}.sig`;
  try {
    return readFileSync(sigPath, 'utf8').trim();
  } catch {
    return null;
  }
}

function classify(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.sig')) return [];
  if (lower.endsWith('.app.tar.gz')) {
    if (lower.includes('aarch64') && !lower.includes('universal')) {
      return ['darwin-aarch64'];
    }
    if (lower.includes('x64') || lower.includes('x86_64')) {
      return ['darwin-x86_64'];
    }
    // Universal .app.tar.gz serves both Mac architectures.
    return ['darwin-aarch64', 'darwin-x86_64'];
  }
  if (lower.includes('nsis.zip') || (lower.endsWith('.zip') && lower.includes('setup'))) {
    return ['windows-x86_64'];
  }
  if (lower.endsWith('.appimage.tar.gz')) {
    return ['linux-x86_64'];
  }
  return [];
}

const dir = resolve(arg('dir', '.'));
const version = arg('version');
const baseUrl = arg('base-url', 'https://releases.sovlium.ru/desktop').replace(/\/$/, '');
const outDir = resolve(arg('out', './publish'));
const notes = arg('notes', '');

if (!version) {
  console.error('missing --version');
  process.exit(1);
}

const files = walk(dir);
const platforms = {};
const copied = [];

const versionDir = join(outDir, version);
mkdirSync(versionDir, { recursive: true });

for (const file of files) {
  const name = basename(file);
  const keys = classify(name);
  if (keys.length === 0) continue;
  const signature = readSig(file);
  if (!signature) {
    console.warn(`skip ${name}: missing .sig`);
    continue;
  }
  copyFileSync(file, join(versionDir, name));
  copyFileSync(`${file}.sig`, join(versionDir, `${name}.sig`));
  copied.push(name);
  const url = `${baseUrl}/${version}/${name}`;
  for (const key of keys) {
    platforms[key] = { signature, url };
  }
}

if (Object.keys(platforms).length === 0) {
  console.error(`no signed updater bundles found in ${dir}`);
  process.exit(1);
}

const manifest = {
  version,
  notes,
  pub_date: new Date().toISOString(),
  platforms,
};

writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(join(versionDir, 'latest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`wrote ${join(outDir, 'latest.json')} for ${copied.join(', ')}`);
