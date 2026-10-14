import { mkdir } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getLoanStatus, LendingError, planBorrow, planReturn } from './core.js';
import { EQUIPMENT, initializeDatabase, openDatabase } from './database.js';
import { createLendingService } from './service.js';
import { formatInstantInTimeZone, parseUtcMilliseconds, toUtcIso } from './time.js';

const DEFAULT_DATABASE = 'data/equipment-demo.sqlite';

function invalidScenario(message) {
  return new LendingError('INVALID_SCENARIO', message);
}

function validateScenario(scenario) {
  if (
    !scenario ||
    typeof scenario !== 'object' ||
    Array.isArray(scenario) ||
    !Array.isArray(scenario.operations)
  ) {
    throw invalidScenario('情境檔必須包含 operations 陣列。');
  }
  const nowMs = parseUtcMilliseconds(scenario.at);
  for (const operation of scenario.operations) {
    if (
      !operation ||
      typeof operation !== 'object' ||
      !['borrow', 'return'].includes(operation.action)
    ) {
      throw invalidScenario('operations 僅支援 borrow 與 return。');
    }
  }
  return nowMs;
}

function createReport(loans, nowMs) {
  const activeLoans = loans.filter((loan) => loan.returnedAtMs === null);
  const equipment = EQUIPMENT.map((item) => {
    const activeLoan = activeLoans.find((loan) => loan.equipmentId === item.equipmentId);
    return {
      equipmentId: item.equipmentId,
      name: item.name,
      status: activeLoan ? getLoanStatus(activeLoan, nowMs) : 'available',
      activeLoanId: activeLoan?.loanId ?? null,
    };
  });
  const loanViews = loans
    .slice()
    .sort((left, right) => left.loanId - right.loanId)
    .map((loan) => ({
      loanId: loan.loanId,
      equipmentId: loan.equipmentId,
      borrowerId: loan.borrowerId,
      borrowedAt: toUtcIso(loan.borrowedAtMs),
      dueAt: toUtcIso(loan.dueAtMs),
      returnedAt: loan.returnedAtMs === null ? null : toUtcIso(loan.returnedAtMs),
      status: getLoanStatus(loan, nowMs),
    }));
  const summary = { available: 0, borrowed: 0, overdue: 0 };
  for (const item of equipment) {
    summary[item.status] += 1;
  }
  return { asOf: toUtcIso(nowMs), equipment, loans: loanViews, summary };
}

async function runScenario(filePath) {
  let scenario;
  try {
    scenario = JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw invalidScenario('情境檔不是有效的 JSON。');
    }
    if (['EACCES', 'EISDIR', 'ENOENT'].includes(error?.code)) {
      throw invalidScenario('無法讀取情境檔。');
    }
    throw error;
  }
  const nowMs = validateScenario(scenario);
  const loans = [];
  let nextLoanId = 1;
  const results = [];

  for (const operation of scenario.operations) {
    try {
      if (operation.action === 'borrow') {
        const item = EQUIPMENT.find((candidate) => candidate.equipmentId === operation.equipmentId);
        const activeLoan = loans.find(
          (loan) => loan.equipmentId === operation.equipmentId && loan.returnedAtMs === null,
        );
        const loan = planBorrow({
          equipment: item ?? null,
          activeLoan: activeLoan ?? null,
          input: operation,
          nowMs,
        });
        const persisted = { ...loan, loanId: nextLoanId++ };
        loans.push(persisted);
        results.push({
          action: operation.action,
          loanId: persisted.loanId,
          status: 'borrowed',
          dueAt: toUtcIso(persisted.dueAtMs),
        });
      } else {
        const loan = loans.find((candidate) => candidate.loanId === operation.loanId);
        const updated = planReturn({ loan: loan ?? null, nowMs });
        Object.assign(loan, updated);
        results.push({
          action: operation.action,
          loanId: updated.loanId,
          returnedAt: toUtcIso(updated.returnedAtMs),
          status: 'returned',
        });
      }
    } catch (error) {
      if (!(error instanceof LendingError)) {
        throw error;
      }
      results.push({ action: operation.action, error: { code: error.code } });
    }
  }

  return { asOf: toUtcIso(nowMs), results, ...createReport(loans, nowMs) };
}

function parseArgs(args) {
  if (args.length !== 3 || args[0] !== 'scenario' || args[2] !== '--json') {
    return parseCommand(args);
  }
  return { command: 'scenario', filePath: args[1] };
}

function parseCommand(args) {
  const [command, ...rest] = args;
  if (command === 'scenario' && rest.length === 2 && rest[1] === '--json') {
    return { command, filePath: rest[0] };
  }
  if (!['init', 'borrow', 'return', 'report'].includes(command)) {
    throw new LendingError('INVALID_ARGUMENTS', '命令須為 init、borrow、return、report 或 scenario。');
  }

  const positional = [];
  let database = DEFAULT_DATABASE;
  let json = false;
  let databaseProvided = false;
  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === '--json') {
      if (json) throw new LendingError('INVALID_ARGUMENTS', '--json 不可重複。');
      json = true;
    } else if (value === '--database') {
      if (databaseProvided || rest[index + 1] === undefined || rest[index + 1].startsWith('--')) {
        throw new LendingError('INVALID_ARGUMENTS', '--database 須提供且只能提供一個路徑。');
      }
      database = rest[index + 1];
      databaseProvided = true;
      index += 1;
    } else if (value.startsWith('--')) {
      throw new LendingError('INVALID_ARGUMENTS', `不支援的選項：${value}`);
    } else {
      positional.push(value);
    }
  }

  const expected = { init: [0, 0], borrow: [2, 3], return: [1, 1], report: [0, 0] }[command];
  if (positional.length < expected[0] || positional.length > expected[1] || database === ':memory:') {
    throw new LendingError('INVALID_ARGUMENTS', '命令參數錯誤，請確認設備、借用人、借用天數及資料庫路徑。');
  }
  return { command, positional, database, json };
}

function parsePositiveInteger(value, code, label) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new LendingError(code, `${label}須為正整數。`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new LendingError(code, `${label}超出安全整數範圍。`);
  }
  return parsed;
}

function toHumanTime(instant, timeZone) {
  return formatInstantInTimeZone(instant, timeZone, 'zh-TW');
}

function printHuman(command, result, timeZone) {
  if (command === 'init') {
    console.log(`資料庫初始化完成：${result.databasePath}`);
    return;
  }
  if (command === 'borrow') {
    console.log(`借用成立：${result.equipmentId}／${result.borrowerId}（借用編號 #${result.loanId}）`);
    console.log(`到期：${toHumanTime(result.dueAt, timeZone)}`);
  } else if (command === 'return') {
    console.log(`已歸還借用編號 #${result.loanId}。`);
    console.log(`歸還時間：${toHumanTime(result.returnedAt, timeZone)}`);
  } else {
    console.log(`設備借用狀態（${result.asOf}）`);
    for (const item of result.equipment) {
      console.log(`${item.equipmentId} ${item.name}：${item.status}`);
    }
    for (const loan of result.loans) {
      console.log(
        `#${loan.loanId} ${loan.equipmentId}／${loan.borrowerId}：${loan.status}；到期 ${toHumanTime(loan.dueAt, timeZone)}`,
      );
    }
    console.log(
      `可借 ${result.summary.available}；借用中 ${result.summary.borrowed}；逾期 ${result.summary.overdue}`,
    );
  }
  console.log(`顯示時區：${timeZone}`);
}

async function executeCommand(parsed) {
  const { command, positional, database } = parsed;
  const databasePath = resolve(database);
  if (command === 'init') {
    await mkdir(dirname(databasePath), { recursive: true });
    const created = initializeDatabase(databasePath);
    created.close();
    return { databasePath };
  }

  const readOnly = command === 'report';
  const db = openDatabase(databasePath, { readOnly });
  const reportDb = readOnly ? db : openDatabase(databasePath, { readOnly: true });
  try {
    const service = createLendingService({ db, reportDb });
    if (command === 'borrow') {
      const days = positional[2] === undefined
        ? undefined
        : parsePositiveInteger(positional[2], 'INVALID_DAYS', '借用天數');
      return service.borrow({
        equipmentId: positional[0],
        borrowerId: positional[1],
        ...(days === undefined ? {} : { days }),
      });
    }
    if (command === 'return') {
      return service.returnLoan(parsePositiveInteger(positional[0], 'INVALID_LOAN_ID', '借用編號'));
    }
    return service.report();
  } finally {
    if (reportDb !== db) {
      reportDb.close();
    }
    db.close();
  }
}

async function main(args) {
  try {
    const parsed = parseArgs(args);
    const result = parsed.command === 'scenario'
      ? await runScenario(resolve(parsed.filePath))
      : await executeCommand(parsed);
    if (parsed.json || parsed.command === 'scenario') {
      console.log(JSON.stringify(result));
    } else {
      const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
      printHuman(parsed.command, result, timeZone);
    }
    return 0;
  } catch (error) {
    if (error instanceof LendingError) {
      if (args.includes('--json')) {
        console.error(JSON.stringify({ error: { code: error.code, message: error.message } }));
      } else {
        console.error(`錯誤 [${error.code}]：${error.message}`);
      }
      return 1;
    }
    console.error('未預期的執行錯誤：', error);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = await main(process.argv.slice(2));
}
