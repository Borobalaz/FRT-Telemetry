#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const result = spawnSync(process.execPath, ['scripts/publish-github.mjs'], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
