import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addDaysUtc, formatInstantInTimeZone, parseUtcMilliseconds, toUtcIso } from '../src/time.js';

test('UTC instants round-trip and reject timestamps without an explicit UTC suffix', () => {
  const instant = '2026-01-15T00:00:00.000Z';
  assert.equal(toUtcIso(parseUtcMilliseconds(instant)), instant);
  assert.throws(() => parseUtcMilliseconds('2026-01-15T00:00:00'), RangeError);
});

test('one lending day is exactly 24 elapsed hours across the Los Angeles DST change', () => {
  const start = '2026-03-08T09:30:00.000Z';
  const end = addDaysUtc(start, 1);
  assert.equal(end, '2026-03-09T09:30:00.000Z');
  assert.equal(formatInstantInTimeZone(start, 'America/Los_Angeles'), '08/03/2026, 01:30 GMT-08:00');
  assert.equal(formatInstantInTimeZone(end, 'America/Los_Angeles'), '09/03/2026, 02:30 GMT-07:00');
  assert.equal(formatInstantInTimeZone(start, 'Asia/Taipei'), '08/03/2026, 17:30 GMT+08:00');
  assert.equal(formatInstantInTimeZone(end, 'Asia/Taipei'), '09/03/2026, 17:30 GMT+08:00');
});
