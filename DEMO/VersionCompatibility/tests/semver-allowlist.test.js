import { test } from 'node:test';
import assert from 'node:assert/strict';
import semver from 'semver';
import { checkCompatibility, CompatibilityInputError } from '../src/core.js';

// semver.validRange 與 semver.valid 的鬆散行為不能取代本專案的輸入白名單；這些輸入套件本身會放行。
const rangesPackageAccepts = [
  '1.x',
  '1.X',
  '1.2.x',
  '1.2.*',
  '*',
  'x',
  '',
  '1',
  '1.2',
  '^1.2',
  '~1',
  '~>1.2.3',
  '>=1.2',
  '>= 1.2.3',
  '>=1.0.0 <2.0.0',
  '1.0.0 || 2.0.0',
  '1.0.0||2.0.0',
  '1.0.0 - 2.0.0',
  'v1.2.3',
  '=v1.2.3',
  '^ 1.2.3',
];

const versionsPackageAccepts = ['v1.2.3', ' v1.2.3 '];

for (const range of rangesPackageAccepts) {
  test(`allowlist: semver accepts range ${JSON.stringify(range)} but checkCompatibility rejects it`, () => {
    // Arrange
    const version = '1.2.3';
    const packageResult = semver.validRange(range);

    // Act
    let error;
    try {
      checkCompatibility(version, range);
    } catch (caught) {
      error = caught;
    }

    // Assert
    assert.notEqual(packageResult, null);
    assert.ok(error instanceof CompatibilityInputError);
    assert.equal(error.code, 'INVALID_RANGE');
  });
}

for (const version of versionsPackageAccepts) {
  test(`allowlist: semver accepts version ${JSON.stringify(version)} but checkCompatibility rejects it`, () => {
    // Arrange
    const packageResult = semver.valid(version);

    // Act
    let error;
    try {
      checkCompatibility(version, '>=1.0.0');
    } catch (caught) {
      error = caught;
    }

    // Assert
    assert.notEqual(packageResult, null);
    assert.ok(error instanceof CompatibilityInputError);
    assert.equal(error.code, 'INVALID_VERSION');
  });
}

test('does not enable loose or includePrerelease behavior', () => {
  // Arrange
  const version = '1.2.4-beta.1';
  const range = '^1.2.3';

  // Act
  const result = checkCompatibility(version, range);

  // Assert
  assert.equal(semver.satisfies(version, range, { includePrerelease: true }), true);
  assert.equal(result.satisfies, false);
});
