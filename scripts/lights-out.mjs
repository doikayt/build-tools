#!/usr/bin/env node
import { execSync, spawn } from 'child_process';
import { readFileSync, existsSync, mkdirSync, createWriteStream } from 'fs';
import { resolve } from 'path';
import { parseArgs } from 'util';

const IDLE_WARNING_MS = 3 * 60 * 1000; // warn if no output for 3 minutes

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

const logDir = resolve(gitRoot, '.lights-out-logs');
mkdirSync(logDir, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = resolve(logDir, `${branch}-${timestamp}.log`);
const logStream = createWriteStream(logPath, { flags: 'a' });

console.log(`Branch:   ${branch}`);
console.log(`Spec:     ${specPath}`);
console.log(`Worktree: ${worktreePath}`);
console.log(`Log:      ${logPath}`);
console.log(`          (tail -f "${logPath}" from another terminal to follow along)`);
console.log('');

execSync(`git worktree add "${worktreePath}" -b "${branch}"`, { cwd: gitRoot, stdio: 'inherit' });

console.log('\n--- lights-out session starting ---\n');

const claude = spawn('claude', ['-p', spec, '--dangerously-skip-permissions'], {
  cwd: worktreePath,
  stdio: ['inherit', 'pipe', 'pipe'],
});

let lastOutputAt = Date.now();
let idleWarningIssued = false;

function relay(stream, chunk) {
  lastOutputAt = Date.now();
  idleWarningIssued = false;
  stream.write(chunk);
  logStream.write(chunk);
}

claude.stdout.on('data', (chunk) => relay(process.stdout, chunk));
claude.stderr.on('data', (chunk) => relay(process.stderr, chunk));

const idleCheck = setInterval(() => {
  const idleMs = Date.now() - lastOutputAt;
  if (idleMs >= IDLE_WARNING_MS && !idleWarningIssued) {
    idleWarningIssued = true;
    const msg = `\n⚠ no output for ${Math.round(idleMs / 1000)}s — session may be stuck (pid ${claude.pid})\n`;
    process.stderr.write(msg);
    logStream.write(msg);
  }
}, 30_000);

claude.on('close', (code) => {
  clearInterval(idleCheck);
  logStream.end();
  console.log(`\n--- session complete (exit ${code}) ---`);
  console.log(`\nWorktree: ${worktreePath}`);
  console.log(`Branch:   ${branch}`);
  console.log(`Log:      ${logPath}`);
  console.log('\nNext steps:');
  console.log(`  cd "${worktreePath}" && git diff main`);
  console.log(`  git push -u origin "${branch}"`);
  console.log(`  git worktree remove "${worktreePath}"   # when done`);
});
