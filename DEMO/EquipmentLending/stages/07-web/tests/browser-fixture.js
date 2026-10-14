import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createServer as createNetServer } from 'node:net';
import { resolve } from 'node:path';
import { test as base, expect } from '@playwright/test';
import { initializeDatabase } from '../src/database.js';

const projectRoot = resolve(import.meta.dirname, '..');
const testDataDir = resolve(projectRoot, '.test-data');

async function findAvailablePort() {
  const probe = createNetServer();
  await new Promise((resolveListen, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolveListen);
  });
  const { port } = probe.address();
  await new Promise((resolveClose, reject) => {
    probe.close((error) => error ? reject(error) : resolveClose());
  });
  return port;
}

async function startServer(databasePath) {
  const port = await findAvailablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      DATABASE_PATH: databasePath,
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
  child.stderr.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
  let spawnError;
  child.once('error', (error) => { spawnError = error; });

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`設備借用 server 提前結束：${output}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return { baseUrl, child, output: () => output };
    } catch {
      // The server has not started listening yet.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
  }
  child.kill();
  throw new Error(`等待設備借用 server 啟動逾時：${output}`);
}

async function stopServer(server) {
  if (!server || server.child.exitCode !== null || server.child.signalCode !== null) return;
  const exited = new Promise((resolveExit) => server.child.once('exit', resolveExit));
  server.child.kill();
  const timeout = new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5000));
  await Promise.race([exited, timeout]);
  if (server.child.exitCode === null && server.child.signalCode === null) {
    server.child.kill('SIGKILL');
    await exited;
  }
}

const test = base.extend({
  app: async ({}, use, testInfo) => {
    await mkdir(testDataDir, { recursive: true });
    const databasePath = resolve(
      testDataDir,
      `browser-${testInfo.workerIndex}-${randomUUID()}.sqlite`,
    );
    const db = initializeDatabase(databasePath);
    db.close();
    let server = await startServer(databasePath);
    const app = {
      databasePath,
      get baseUrl() { return server.baseUrl; },
      async restart() {
        await stopServer(server);
        server = await startServer(databasePath);
      },
    };
    try {
      await use(app);
    } finally {
      await stopServer(server);
    }
  },
});

export { expect, test };
