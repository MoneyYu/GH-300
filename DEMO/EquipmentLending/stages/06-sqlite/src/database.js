import { closeSync, existsSync, openSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { LendingError } from './core.js';

const SCHEMA_VERSION = 1;
const DAY_MS = 86_400_000;
const EQUIPMENT = [
  { equipmentId: 'EQ-001', name: '示範相機' },
  { equipmentId: 'EQ-002', name: '示範投影機' },
  { equipmentId: 'EQ-003', name: '示範筆電' },
];

function createSchema(db) {
  db.exec(`
    CREATE TABLE equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    ) STRICT;

    CREATE TABLE loans (
      id INTEGER PRIMARY KEY,
      equipment_id TEXT NOT NULL REFERENCES equipment(id),
      borrower_id TEXT NOT NULL,
      borrowed_at_ms INTEGER NOT NULL CHECK (borrowed_at_ms >= 0),
      due_at_ms INTEGER NOT NULL CHECK (due_at_ms > borrowed_at_ms),
      returned_at_ms INTEGER CHECK (
        returned_at_ms IS NULL OR returned_at_ms >= borrowed_at_ms
      )
    ) STRICT;

    CREATE UNIQUE INDEX one_active_loan_per_equipment
      ON loans(equipment_id)
      WHERE returned_at_ms IS NULL;

    PRAGMA user_version = ${SCHEMA_VERSION};
  `);
  const insertEquipment = db.prepare('INSERT INTO equipment (id, name) VALUES (?, ?)');
  for (const item of EQUIPMENT) {
    insertEquipment.run(item.equipmentId, item.name);
  }
}

function validateClock(clock) {
  const nowMs = clock();
  if (!Number.isSafeInteger(nowMs) || nowMs < DAY_MS * 8) {
    throw new LendingError('INVALID_TIME', '初始化時間無法建立示範逾期紀錄。');
  }
  return nowMs;
}

function addOverdueDemoLoan(db, nowMs) {
  db.prepare(
    `INSERT INTO loans
      (equipment_id, borrower_id, borrowed_at_ms, due_at_ms, returned_at_ms)
     VALUES (?, ?, ?, ?, NULL)`,
  ).run('EQ-003', 'DEMO-B', nowMs - 8 * DAY_MS, nowMs - DAY_MS);
}

export function initializeDatabase(filename, { clock = Date.now, seedDemoLoan = true } = {}) {
  let db;
  if (filename === ':memory:') {
    db = new DatabaseSync(filename, { enableForeignKeyConstraints: true });
  } else {
    let descriptor;
    try {
      descriptor = openSync(filename, 'wx');
    } catch (error) {
      if (error.code === 'EEXIST') {
        throw new LendingError('DATABASE_EXISTS', '資料庫路徑已存在；為避免覆寫，初始化已停止。');
      }
      throw error;
    }
    closeSync(descriptor);
    db = new DatabaseSync(filename, { enableForeignKeyConstraints: true });
  }

  try {
    createSchema(db);
    if (seedDemoLoan) {
      addOverdueDemoLoan(db, validateClock(clock));
    }
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

export function openDatabase(filename, { readOnly = false } = {}) {
  if (filename !== ':memory:' && !existsSync(filename)) {
    throw new LendingError('DATABASE_NOT_FOUND', `找不到既有資料庫：${filename}`);
  }

  let db;
  try {
    db = new DatabaseSync(filename, {
      readOnly,
      enableForeignKeyConstraints: true,
    });
  } catch (error) {
    throw new LendingError('DATABASE_OPEN_FAILED', `無法開啟資料庫：${error.message}`);
  }

  const version = db.prepare('PRAGMA user_version').get().user_version;
  if (version !== SCHEMA_VERSION) {
    db.close();
    throw new LendingError(
      'DATABASE_SCHEMA_UNSUPPORTED',
      `資料庫結構版本 ${version} 不受支援；預期版本 ${SCHEMA_VERSION}。`,
    );
  }
  return db;
}

export { EQUIPMENT };
