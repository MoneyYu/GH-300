import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runScenario } from '../src/scenario.js';

test('borrow, return, then borrow the same equipment again', async () => {
  const fixture = JSON.parse(await readFile(new URL('../fixtures/acceptance.json', import.meta.url), 'utf8'));
  const result = runScenario(fixture.operations);
  assert.deepEqual(result.results.map((entry) => entry.status), ['borrowed', 'returned', 'borrowed']);
  assert.equal(result.results[0].dueAt, '2026-01-22T00:00:00.000Z');
  assert.equal(result.loans.length, 2);
  assert.equal(result.loans[0].returnedAt, '2026-01-15T00:00:00.000Z');
  assert.equal(result.loans[1].status, 'borrowed');
});
