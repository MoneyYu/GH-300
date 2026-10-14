const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
export const DAY_MS = 86_400_000;

export function parseUtcMilliseconds(value) {
  if (typeof value !== 'string' || !UTC_INSTANT.test(value)) {
    throw new RangeError('時間必須是含毫秒的 ISO UTC 瞬間，例如 2026-01-15T00:00:00.000Z。');
  }
  const milliseconds = Date.parse(value);
  if (!Number.isSafeInteger(milliseconds) || toUtcIso(milliseconds) !== value) {
    throw new RangeError('時間不是有效的 ISO UTC 瞬間。');
  }
  return milliseconds;
}

export function toUtcIso(milliseconds) {
  if (!Number.isSafeInteger(milliseconds) || milliseconds < 0) {
    throw new RangeError('UTC 毫秒時間必須是非負安全整數。');
  }
  return new Date(milliseconds).toISOString();
}

export function addDaysUtc(instant, days) {
  if (!Number.isInteger(days) || days < 1 || days > 14) {
    throw new RangeError('借用天數須為 1–14 的整數。');
  }
  return toUtcIso(parseUtcMilliseconds(instant) + days * DAY_MS);
}

export function formatInstantInTimeZone(instant, timeZone, locale = 'en-GB') {
  const date = new Date(parseUtcMilliseconds(instant));
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset',
  }).format(date);
}
