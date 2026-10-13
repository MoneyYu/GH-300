import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkCompatibility, CompatibilityInputError } from '../src/core.js';

const fixtures = JSON.parse(
  readFileSync(new URL('../fixtures/cases.json', import.meta.url), 'utf8'),
);

function captureError(action) {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
}

test('compares numeric minor versions', () => {
  // Arrange
  const version = '1.10.0';
  const range = '>=1.9.0';

  // Act
  const result = checkCompatibility(version, range);

  // Assert
  assert.equal(result.satisfies, true);
});

test('returns the trimmed version, range and result', () => {
  // Arrange
  const version = ' 1.10.0 ';
  const range = '  >=1.9.0  ';

  // Act
  const result = checkCompatibility(version, range);

  // Assert
  assert.deepEqual(result, { version: '1.10.0', range: '>=1.9.0', satisfies: true });
});

test('keeps an operator-less range as the trimmed input', () => {
  // Arrange
  const version = '1.2.3';
  const range = ' 1.2.3 ';

  // Act
  const result = checkCompatibility(version, range);

  // Assert
  assert.deepEqual(result, { version: '1.2.3', range: '1.2.3', satisfies: true });
});

for (const { version, range, satisfies } of fixtures.compatible) {
  test(`fixture: ${version} ${JSON.stringify(range)} satisfies=${satisfies}`, () => {
    // Arrange
    const input = { version, range };

    // Act
    const result = checkCompatibility(input.version, input.range);

    // Assert
    assert.equal(result.satisfies, satisfies);
  });
}

for (const { version, range } of fixtures.invalidVersion) {
  test(`fixture: version ${JSON.stringify(version)} is INVALID_VERSION`, () => {
    // Arrange
    const input = { version, range };

    // Act
    const error = captureError(() => checkCompatibility(input.version, input.range));

    // Assert
    assert.ok(error instanceof CompatibilityInputError);
    assert.equal(error.code, 'INVALID_VERSION');
  });
}

for (const { version, range } of fixtures.invalidRange) {
  test(`fixture: range ${JSON.stringify(range)} is INVALID_RANGE`, () => {
    // Arrange
    const input = { version, range };

    // Act
    const error = captureError(() => checkCompatibility(input.version, input.range));

    // Assert
    assert.ok(error instanceof CompatibilityInputError);
    assert.equal(error.code, 'INVALID_RANGE');
  });
}

test('reports INVALID_VERSION before INVALID_RANGE when both are invalid', () => {
  // Arrange
  const version = '1.2';
  const range = '^1.2.3';

  // Act
  const error = captureError(() => checkCompatibility(version, range));

  // Assert
  assert.ok(error instanceof CompatibilityInputError);
  assert.equal(error.code, 'INVALID_VERSION');
});

test('treats a non-string version as INVALID_VERSION', () => {
  // Arrange
  const version = undefined;
  const range = '>=1.0.0';

  // Act
  const error = captureError(() => checkCompatibility(version, range));

  // Assert
  assert.ok(error instanceof CompatibilityInputError);
  assert.equal(error.code, 'INVALID_VERSION');
});

test('treats a non-string range as INVALID_RANGE', () => {
  // Arrange
  const version = '1.0.0';
  const range = null;

  // Act
  const error = captureError(() => checkCompatibility(version, range));

  // Assert
  assert.ok(error instanceof CompatibilityInputError);
  assert.equal(error.code, 'INVALID_RANGE');
});
test('exposes input errors as Error instances with a name and message', () => {
  // Arrange
  const version = '1.02.3';
  const range = '>=1.0.0';

  // Act
  const error = captureError(() => checkCompatibility(version, range));

  // Assert
  assert.ok(error instanceof Error);
  assert.equal(error.name, 'CompatibilityInputError');
  assert.ok(error.message.length > 0);
});

test('applies caret semantics: ^1.2.3 accepts 1.3.0 but not 2.0.0', () => {
  // Arrange
  const range = '^1.2.3';

  // Act
  const accepted = checkCompatibility('1.3.0', range);
  const rejected = checkCompatibility('2.0.0', range);

  // Assert
  assert.equal(accepted.satisfies, true);
  assert.equal(rejected.satisfies, false);
});

test('applies tilde semantics: ~1.2.3 accepts 1.2.9 but not 1.3.0', () => {
  // Arrange
  const range = '~1.2.3';

  // Act
  const accepted = checkCompatibility('1.2.9', range);
  const rejected = checkCompatibility('1.3.0', range);

  // Assert
  assert.equal(accepted.satisfies, true);
  assert.equal(rejected.satisfies, false);
});

test('treats a 0.x caret as locking the minor version', () => {
  // Arrange
  const range = '^0.2.3';

  // Act
  const accepted = checkCompatibility('0.2.9', range);
  const rejected = checkCompatibility('0.3.0', range);

  // Assert
  assert.equal(accepted.satisfies, true);
  assert.equal(rejected.satisfies, false);
});

test('excludes a pre-release version from a range without a matching pre-release tuple', () => {
  // Arrange
  const version = '1.2.4-beta.1';
  const range = '^1.2.3';

  // Act
  const result = checkCompatibility(version, range);

  // Assert
  assert.equal(result.satisfies, false);
});

test('ignores build metadata when comparing', () => {
  // Arrange
  const version = '1.2.3+build.1';
  const range = '=1.2.3';

  // Act
  const result = checkCompatibility(version, range);

  // Assert
  assert.deepEqual(result, { version: '1.2.3+build.1', range: '=1.2.3', satisfies: true });
});

test('returns trimmed full SemVer text with caret and tilde ranges unchanged', () => {
  // Arrange
  const version = ' 1.2.3-beta.2+build.5 ';
  const range = '  ^1.2.3-beta.1  ';

  // Act
  const result = checkCompatibility(version, range);

  // Assert
  assert.deepEqual(result, {
    version: '1.2.3-beta.2+build.5',
    range: '^1.2.3-beta.1',
    satisfies: true,
  });
});

test('reports INVALID_VERSION before INVALID_RANGE for a malformed pre-release version', () => {
  // Arrange
  const version = '1.2.3-01';
  const range = '^1.2';

  // Act
  const error = captureError(() => checkCompatibility(version, range));

  // Assert
  assert.ok(error instanceof CompatibilityInputError);
  assert.equal(error.code, 'INVALID_VERSION');
});

test('rejects a version longer than the package parser limit as INVALID_VERSION', () => {
  // Arrange
  const version = `1.0.0-${'a'.repeat(300)}`;
  const range = '>=1.0.0';

  // Act
  const error = captureError(() => checkCompatibility(version, range));

  // Assert
  assert.ok(error instanceof CompatibilityInputError);
  assert.equal(error.code, 'INVALID_VERSION');
});

test('rejects a range version longer than the package parser limit as INVALID_RANGE', () => {
  // Arrange
  const version = '1.0.0';
  const range = `>=1.0.0-${'a'.repeat(300)}`;

  // Act
  const error = captureError(() => checkCompatibility(version, range));

  // Assert
  assert.ok(error instanceof CompatibilityInputError);
  assert.equal(error.code, 'INVALID_RANGE');
});
