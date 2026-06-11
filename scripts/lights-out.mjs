#!/usr/bin/env node
import { execSync, spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    spec: { type: 'string' },
    branch: { type: 'string' },
  },
});

if (!values.spec || !values.branch) {
  console.error('Usage: lights-out.mjs --spec <path> --branch <name>');
  process.exit(1);
}

const specPath = resolve(values.spec);
if (!existsSync(specPath)) {
  console.error(`Spec file not found: ${specPath}`);
  process.exit(1);
}

const branch = values.branch;
const spec = readFileSync(specPath, 'utf-8');
const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
const worktreePath = resolve(gitRoot, '..', `lights-out-${branch}`);

if (existsSync(worktreePath)) {
  console.error(`Worktree path already exists: ${worktreePath}`);
  console.error(`Remove it first: git worktree remove "${worktreePath}"`);
  process.exit(1);
}

console.log(`Branch:   ${branch}`);
console.log(`Spec:     ${specPath}`);
console.log(`Worktree: ${worktreePath}`);
console.log('');

execSync(`git worktree add "${worktreePath}" -b "${branch}"`, { cwd: gitRoot, stdio: 'inherit' });

console.log('\n--- lights-out session starting ---\n');

const claude = spawn('claude', ['-p', spec, '--dangerously-skip-permissions'], {
  cwd: worktreePath,
  stdio: 'inherit',
});

claude.on('close', (code) => {
  console.log(`\n--- session complete (exit ${code}) ---`);
  console.log(`\nWorktree: ${worktreePath}`);
  console.log(`Branch:   ${branch}`);
  console.log('\nNext steps:');
  console.log(`  cd "${worktreePath}" && git diff main`);
  console.log(`  git push -u origin "${branch}"`);
  console.log(`  git worktree remove "${worktreePath}"   # when done`);
});
