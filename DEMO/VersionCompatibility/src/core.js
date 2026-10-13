import semver from 'semver';

const NUMERIC = '0|[1-9]\\d*';
const PRERELEASE_IDENTIFIER = `${NUMERIC}|\\d*[A-Za-z-][0-9A-Za-z-]*`;
const FULL_SEMVER = new RegExp(
  `^(${NUMERIC})\\.(${NUMERIC})\\.(${NUMERIC})` +
    `(?:-((?:${PRERELEASE_IDENTIFIER})(?:\\.(?:${PRERELEASE_IDENTIFIER}))*))?` +
    '(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$',
);
const SINGLE_CONDITION = /^(>=|<=|>|<|=|\^|~)?(.+)$/s;

export class CompatibilityInputError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'CompatibilityInputError';
    this.code = code;
  }
}

// 先由白名單決定語法，套件只負責解析與比較；valid／validRange 本身會放行縮寫、萬用字元、AND／OR 等。
function isStrictSemVer(text) {
  const match = FULL_SEMVER.exec(text);
  if (match === null) {
    return false;
  }
  const [, major, minor, patch, prerelease = ''] = match;
  const numbers = [major, minor, patch, ...prerelease.split('.').filter((id) => /^\d+$/.test(id))];
  return numbers.every((number) => Number.isSafeInteger(Number(number)));
}

function isSupportedRange(text) {
  const match = SINGLE_CONDITION.exec(text);
  return match !== null && isStrictSemVer(match[2]) && semver.validRange(text) !== null;
}

export function checkCompatibility(version, range) {
  if (typeof version !== 'string') {
    throw new CompatibilityInputError('INVALID_VERSION', '版本必須是字串。');
  }
  const trimmedVersion = version.trim();
  if (!isStrictSemVer(trimmedVersion) || semver.valid(trimmedVersion) === null) {
    throw new CompatibilityInputError(
      'INVALID_VERSION',
      `版本必須是完整 SemVer（x.y.z，可含 pre-release 與 build metadata），數字片段不得有前導零或超過 ${Number.MAX_SAFE_INTEGER}，且不接受 v 前綴：${JSON.stringify(version)}`,
    );
  }

  if (typeof range !== 'string') {
    throw new CompatibilityInputError('INVALID_RANGE', '範圍必須是字串。');
  }
  const trimmedRange = range.trim();
  if (!isSupportedRange(trimmedRange)) {
    throw new CompatibilityInputError(
      'INVALID_RANGE',
      `範圍必須是單一條件（=、>、>=、<、<=、^、~）加完整 SemVer，運算子與版本間不得有空白：${JSON.stringify(range)}`,
    );
  }

  return {
    version: trimmedVersion,
    range: trimmedRange,
    satisfies: semver.satisfies(trimmedVersion, trimmedRange),
  };
}
