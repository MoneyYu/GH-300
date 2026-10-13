import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cliPath = fileURLToPath(new URL('../src/cli.js', import.meta.url));

function runCli(...args) {
  const { status, stdout, stderr } = spawnSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf8',
  });
  return { status, stdout, stderr };
}

// 本階段是刻意保留 BUG 的教學快照；此回歸測試預期失敗，直到 02-fixed 修正數值比較。
test('compares numeric minor versions', () => {
  // Arrange
  const version = '1.10.0';
  const range = '>=1.9.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.10.0 符合範圍 >=1.9.0\n');
  assert.equal(result.stderr, '');
  assert.equal(result.status, 0);
});
