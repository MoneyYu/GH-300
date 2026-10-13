const STABLE_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const SINGLE_COMPARATOR = /^(>=|<=|>|<|=)?(.*)$/s;

const COMPARATORS = {
  '=': (order) => order === 0,
  '>': (order) => order > 0,
  '>=': (order) => order >= 0,
  '<': (order) => order < 0,
  '<=': (order) => order <= 0,
};

export class CompatibilityInputError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'CompatibilityInputError';
    this.code = code;
  }
}

function parseStableVersion(text) {
  const match = STABLE_VERSION.exec(text);
  if (match === null) {
    return null;
  }
  const segments = match.slice(1).map(Number);
  return segments.every((segment) => Number.isSafeInteger(segment)) ? segments : null;
}

function compareSegments(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] < right[index] ? -1 : 1;
    }
  }
  return 0;
}

function parseRange(text) {
  const [, operator = '=', versionText] = SINGLE_COMPARATOR.exec(text);
  const segments = parseStableVersion(versionText);
  return segments === null ? null : { operator, segments };
}

export function checkCompatibility(version, range) {
  if (typeof version !== 'string') {
    throw new CompatibilityInputError('INVALID_VERSION', '版本必須是字串。');
  }
  const trimmedVersion = version.trim();
  const versionSegments = parseStableVersion(trimmedVersion);
  if (versionSegments === null) {
    throw new CompatibilityInputError(
      'INVALID_VERSION',
      `版本必須是完整穩定的 x.y.z，各片段不得有前導零或超過 ${Number.MAX_SAFE_INTEGER}：${JSON.stringify(version)}`,
    );
  }

  if (typeof range !== 'string') {
    throw new CompatibilityInputError('INVALID_RANGE', '範圍必須是字串。');
  }
  const trimmedRange = range.trim();
  const parsedRange = parseRange(trimmedRange);
  if (parsedRange === null) {
    throw new CompatibilityInputError(
      'INVALID_RANGE',
      `範圍必須是單一條件（=、>、>=、<、<=）加完整穩定的 x.y.z：${JSON.stringify(range)}`,
    );
  }

  const order = compareSegments(versionSegments, parsedRange.segments);
  return {
    version: trimmedVersion,
    range: trimmedRange,
    satisfies: COMPARATORS[parsedRange.operator](order),
  };
}
