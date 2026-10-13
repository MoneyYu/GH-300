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
