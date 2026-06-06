#!/usr/bin/env node
/**
 * Парсинг бинарного Y.Doc доски из БД (Hocuspocus persist).
 *
 * Примеры:
 *   node packages/modules.board/scripts/parse-board-ydoc.mjs ./board-d1468a1d-03b0-4160-b354-9fab1e56911a
 *   node packages/modules.board/scripts/parse-board-ydoc.mjs ./board-.... --export ./snapshot.json
 *   node packages/modules.board/scripts/parse-board-ydoc.mjs ./board-.... --ydoc-id d1468a1d-03b0-4160-b354-9fab1e56911a
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Y from 'yjs';

function ydocIdFromFilename(filePath) {
  const base = path.basename(filePath);
  const m = /^board-([0-9a-f-]{36})$/i.exec(base);
  return m ? m[1] : null;
}

function getDocInfo(doc) {
  const shareKeys = [...doc.share.keys()];
  const tlArrayKeys = shareKeys.filter((k) => k.startsWith('tl_'));
  const meta = Object.fromEntries(doc.getMap('meta').entries());
  const recordsByArray = {};
  let suggestedYdocId = null;
  let maxLen = 0;

  for (const key of tlArrayKeys) {
    const len = doc.getArray(key).length;
    recordsByArray[key] = len;
    if (len > maxLen) {
      maxLen = len;
      suggestedYdocId = key.slice(3);
    }
  }

  return { shareKeys, tlArrayKeys, meta, recordsByArray, suggestedYdocId };
}

/** Как в useYjsStore: если `tl_{ydocId}` пуст, читаем из другого `tl_*`. */
function getRecordsArray(doc, ydocId) {
  const currentKey = `tl_${ydocId}`;
  const target = doc.getArray(currentKey);
  if (target.length > 0) return target;

  for (const key of doc.share.keys()) {
    if (key === currentKey || !key.startsWith('tl_')) continue;
    const source = doc.getArray(key);
    if (source.length > 0) return source;
  }

  return target;
}

function parseArgs(argv) {
  const file = argv[2];
  if (!file) {
    console.error(
      'Usage: node parse-board-ydoc.mjs <path-to-binary> [--export out.json] [--ydoc-id UUID]',
    );
    process.exit(1);
  }

  let exportPath = null;
  let ydocId = null;

  for (let i = 3; i < argv.length; i++) {
    if (argv[i] === '--export') {
      exportPath = argv[++i];
    } else if (argv[i] === '--ydoc-id') {
      ydocId = argv[++i];
    }
  }

  return { file, exportPath, ydocId };
}

const { file, exportPath, ydocId: ydocIdArg } = parseArgs(process.argv);
const binary = fs.readFileSync(file);
const doc = new Y.Doc();
Y.applyUpdate(doc, binary);

const info = getDocInfo(doc);
const ydocId = ydocIdArg ?? ydocIdFromFilename(file) ?? info.suggestedYdocId;

console.log('Yjs board dump:');
console.log('  file:', path.resolve(file));
console.log('  ydocId:', ydocId ?? '(не определён — передайте --ydoc-id)');
console.log('  shareKeys:', info.shareKeys);
console.log('  recordsByArray:', info.recordsByArray);
console.log('  meta.schemaVersion:', info.meta.schemaVersion);

if (!ydocId) {
  process.exit(1);
}

const arr = getRecordsArray(doc, ydocId);
const records = arr.toJSON().map(({ val }) => val);
const typeCounts = {};
for (const r of records) {
  typeCounts[r?.typeName] = (typeCounts[r?.typeName] || 0) + 1;
}
console.log('  records (after duplicate fix):', records.length);
console.log('  by typeName:', typeCounts);

if (exportPath) {
  const importable = records.filter(
    (r) => r && (r.typeName === 'shape' || r.typeName === 'asset'),
  );
  const snapshot = {
    records: importable,
    byId: Object.fromEntries(importable.map((r) => [r.id, r])),
  };
  fs.writeFileSync(exportPath, JSON.stringify(snapshot, null, 2));
  console.log(`Exported ${importable.length} shape/asset records → ${exportPath}`);
  console.log('Импорт в UI: настройки доски → «Импорт JSON» (режим репетитора, dev).');
}
