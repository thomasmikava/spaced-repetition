import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { it } from 'vitest';

it('preserves legacy routes, queries, fragments and GitHub Pages query encoding', () => {
  execFileSync(process.execPath, [resolve('scripts/build-legacy-redirect.check.cjs')]);
});
