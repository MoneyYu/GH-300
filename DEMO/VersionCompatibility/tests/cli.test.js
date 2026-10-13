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

test('reports a lower minor version as not satisfying and still exits 0', () => {
  // Arrange
  const version = '1.9.0';
  const range = '>=1.10.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.9.0 不符合範圍 >=1.10.0\n');
  assert.equal(result.stderr, '');
  assert.equal(result.status, 0);
});

test('compares numeric major versions', () => {
  // Arrange
  const version = '2.0.0';
  const range = '<10.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 2.0.0 符合範圍 <10.0.0\n');
  assert.equal(result.status, 0);
});

test('compares numeric patch versions', () => {
  // Arrange
  const version = '1.0.10';
  const range = '>1.0.9';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.0.10 符合範圍 >1.0.9\n');
  assert.equal(result.status, 0);
});

test('accepts the equality boundary for >=', () => {
  // Arrange
  const version = '1.2.3';
  const range = '>=1.2.3';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.2.3 符合範圍 >=1.2.3\n');
  assert.equal(result.status, 0);
});

test('rejects the equality boundary for >', () => {
  // Arrange
  const version = '1.2.3';
  const range = '>1.2.3';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.2.3 不符合範圍 >1.2.3\n');
  assert.equal(result.status, 0);
});

test('treats a range without an operator as equality', () => {
  // Arrange
  const version = '1.2.3';
  const range = '1.2.3';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.2.3 符合範圍 1.2.3\n');
  assert.equal(result.status, 0);
});

test('trims outer whitespace from version and range', () => {
  // Arrange
  const version = ' 1.10.0 ';
  const range = '  >=1.9.0  ';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.10.0 符合範圍 >=1.9.0\n');
  assert.equal(result.status, 0);
});

test('accepts the largest safe integer in a segment', () => {
  // Arrange
  const version = '9007199254740991.0.0';
  const range = '>=9007199254740990.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 9007199254740991.0.0 符合範圍 >=9007199254740990.0.0\n');
  assert.equal(result.status, 0);
});

test('rejects a version segment above the safe integer limit', () => {
  // Arrange
  const version = '9007199254740992.0.0';
  const range = '>=1.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^輸入錯誤 \[INVALID_VERSION\]/);
  assert.equal(result.status, 1);
});

test('rejects a range segment above the safe integer limit', () => {
  // Arrange
  const version = '1.0.0';
  const range = '<=1.0.9007199254740992';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^輸入錯誤 \[INVALID_RANGE\]/);
  assert.equal(result.status, 1);
});

test('rejects a version with a leading zero', () => {
  // Arrange
  const version = '1.02.3';
  const range = '>=1.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^輸入錯誤 \[INVALID_VERSION\]/);
  assert.equal(result.status, 1);
});

test('rejects a shortened version', () => {
  // Arrange
  const version = '1.2';
  const range = '>=1.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^輸入錯誤 \[INVALID_VERSION\]/);
  assert.equal(result.status, 1);
});

test('rejects a v-prefixed version', () => {
  // Arrange
  const version = 'v1.2.3';
  const range = '>=1.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^輸入錯誤 \[INVALID_VERSION\]/);
  assert.equal(result.status, 1);
});

test('reports a pre-release version as not satisfying a stable range and exits 0', () => {
  // Arrange
  const version = '1.2.4-beta.1';
  const range = '>=1.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.2.4-beta.1 不符合範圍 >=1.0.0\n');
  assert.equal(result.stderr, '');
  assert.equal(result.status, 0);
});

test('accepts a caret range', () => {
  // Arrange
  const version = '1.3.0';
  const range = '^1.2.3';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.3.0 符合範圍 ^1.2.3\n');
  assert.equal(result.stderr, '');
  assert.equal(result.status, 0);
});

test('accepts a tilde range and reports the boundary as not satisfying', () => {
  // Arrange
  const version = '1.3.0';
  const range = '~1.2.3';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.3.0 不符合範圍 ~1.2.3\n');
  assert.equal(result.stderr, '');
  assert.equal(result.status, 0);
});

test('treats build metadata as equal for an exact range', () => {
  // Arrange
  const version = '1.2.3+build.1';
  const range = '=1.2.3';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '版本 1.2.3+build.1 符合範圍 =1.2.3\n');
  assert.equal(result.status, 0);
});

test('rejects a wildcard range as unsupported syntax', () => {
  // Arrange
  const version = '1.3.0';
  const range = '1.x';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^輸入錯誤 \[INVALID_RANGE\]/);
  assert.equal(result.status, 1);
});

test('rejects a malformed pre-release version', () => {
  // Arrange
  const version = '1.2.3-01';
  const range = '>=1.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^輸入錯誤 \[INVALID_VERSION\]/);
  assert.equal(result.status, 1);
});

test('rejects a compound range as unsupported syntax', () => {
  // Arrange
  const version = '1.5.0';
  const range = '>=1.0.0 <2.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^輸入錯誤 \[INVALID_RANGE\]/);
  assert.equal(result.status, 1);
});

test('prints usage and exits 1 when arguments are missing', () => {
  // Arrange
  const args = ['1.10.0'];

  // Act
  const result = runCli(...args);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^用法：/);
  assert.equal(result.status, 1);
});

test('prints usage and exits 1 when there are extra arguments', () => {
  // Arrange
  const args = ['1.10.0', '>=1.9.0', '<2.0.0'];

  // Act
  const result = runCli(...args);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^用法：/);
  assert.equal(result.status, 1);
});

test('rejects an empty version argument as INVALID_VERSION', () => {
  // Arrange
  const version = '';
  const range = '>=1.0.0';

  // Act
  const result = runCli(version, range);

  // Assert
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^輸入錯誤 \[INVALID_VERSION\]/);
  assert.equal(result.status, 1);
});
