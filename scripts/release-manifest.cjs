const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
fs.writeFileSync(
  process.argv[2],
  JSON.stringify(
    {
      release: process.argv[3],
      createdAt: new Date().toISOString(),
      gitRevision: git('rev-parse', 'HEAD'),
      dirty: Boolean(git('status', '--porcelain')),
      databaseProvider: 'postgresql',
    },
    null,
    2,
  ) + '\n',
);
