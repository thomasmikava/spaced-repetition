const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'memoriko-redirect-test-'));
execFileSync(process.execPath, [path.join(__dirname, 'build-legacy-redirect.cjs'), dir]);
const sw = fs.readFileSync(path.join(dir, 'sw.js'), 'utf8');
const context = { URL };
vm.createContext(context);
vm.runInContext(sw.slice(0, sw.indexOf('self.addEventListener')), context);
for (const [from, to] of [
  ['https://thomasmikava.github.io/spaced-repetition/', 'https://memoriko.com/'],
  ['https://thomasmikava.github.io/spaced-repetition/review?lang=de#next', 'https://memoriko.com/review?lang=de#next'],
  [
    'https://thomasmikava.github.io/spaced-repetition/?/courses/5&lang=de~and~mode=review#x',
    'https://memoriko.com/courses/5?lang=de&mode=review#x',
  ],
])
  assert.equal(context.memorikoTarget(from), to);
fs.rmSync(dir, { recursive: true });
console.log('Legacy route/query/fragment redirects passed.');
