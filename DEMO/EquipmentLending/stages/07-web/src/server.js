import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { createServer as createHttpServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LendingError } from './core.js';
import { openDatabase } from './database.js';
import { createLendingService } from './service.js';

const HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;
const MAX_BODY_BYTES = 8192;
const webDir = new URL('../web/', import.meta.url);
const STATIC_ROUTES = new Map([
  ['/', { file: 'index.html', type: 'text/html; charset=utf-8' }],
  ['/index.html', { file: 'index.html', type: 'text/html; charset=utf-8' }],
  ['/app.js', { file: 'app.js', type: 'text/javascript; charset=utf-8' }],
  ['/time.js', { file: '../src/time.js', type: 'text/javascript; charset=utf-8' }],
  ['/styles.css', { file: 'styles.css', type: 'text/css; charset=utf-8' }],
]);

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function sendJson(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(payload);
}

function sendError(res, status, code, message, headers) {
  sendJson(res, status, { error: { code, message } }, headers);
}

function mapLendingError(error) {
  if (error instanceof HttpError) {
    return error;
  }
  if (!(error instanceof LendingError)) {
    return null;
  }
  if (['EQUIPMENT_NOT_FOUND', 'LOAN_NOT_FOUND'].includes(error.code)) {
    return new HttpError(404, error.code, error.message);
  }
  if (['EQUIPMENT_UNAVAILABLE', 'LOAN_ALREADY_RETURNED'].includes(error.code)) {
    return new HttpError(409, error.code, error.message);
  }
  if (error.code === 'DATABASE_BUSY') {
    return new HttpError(503, error.code, error.message);
  }
  if (['INVALID_EQUIPMENT_ID', 'INVALID_BORROWER_ID', 'INVALID_DAYS'].includes(error.code)) {
    return new HttpError(400, error.code, error.message);
  }
  return new HttpError(500, error.code, error.message);
}

async function readJson(req) {
  const contentType = req.headers['content-type'] ?? '';
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(contentType)) {
    req.resume();
    throw new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', '請使用 application/json。');
  }

  const chunks = [];
  let size = 0;
  let oversized = false;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      oversized = true;
      chunks.length = 0;
    } else if (!oversized) {
      chunks.push(chunk);
    }
  }
  if (oversized) {
    throw new HttpError(413, 'PAYLOAD_TOO_LARGE', '請求內容不可超過 8 KiB。');
  }

  let value;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'INVALID_JSON', '請求內容不是有效的 JSON。');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'INVALID_REQUEST', '請求內容必須是 JSON 物件。');
  }
  return value;
}

function validateFields(value, allowed) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    throw new HttpError(400, 'INVALID_REQUEST', '請求包含不支援的欄位。');
  }
}

function validateMutationOrigin(req) {
  const expectedHost = `${HOST}:${req.socket.localPort}`;
  const origin = req.headers.origin;
  if (req.headers.host !== expectedHost || typeof origin !== 'string') {
    throw new HttpError(403, 'INVALID_ORIGIN', '借還操作只允許目前的本機網頁來源。');
  }
  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new HttpError(403, 'INVALID_ORIGIN', '借還操作只允許目前的本機網頁來源。');
  }
  if (originUrl.origin !== `http://${expectedHost}` || originUrl.username || originUrl.password) {
    throw new HttpError(403, 'INVALID_ORIGIN', '借還操作只允許目前的本機網頁來源。');
  }
}

async function serveStatic(res, route) {
  let content = await readFile(new URL(route.file, webDir));
  let contentSecurityPolicy =
    "default-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'";
  if (route.file === 'index.html') {
    const nonce = randomBytes(18).toString('base64');
    const html = content.toString('utf8');
    const withNonce = html.replace('nonce="__CSP_NONCE__"', `nonce="${nonce}"`);
    if (withNonce === html) {
      throw new Error('index.html 缺少主題 script 的 CSP nonce 標記。');
    }
    content = Buffer.from(withNonce);
    contentSecurityPolicy =
      `default-src 'self'; script-src 'self' 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'`;
  }
  res.writeHead(200, {
    'Content-Type': route.type,
    'Content-Length': content.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': contentSecurityPolicy,
    'Referrer-Policy': 'no-referrer',
  });
  res.end(content);
}

function pathWithoutQuery(target) {
  const queryStart = target.indexOf('?');
  return queryStart === -1 ? target : target.slice(0, queryStart);
}

async function readRequestBody(req, res) {
  try {
    return await readJson(req);
  } catch (error) {
    if (error instanceof HttpError) {
      sendError(res, error.status, error.code, error.message);
      return null;
    }
    throw error;
  }
}

function createServer({ service, logError = console.error } = {}) {
  if (!service || !['borrow', 'returnLoan', 'report'].every((key) => typeof service[key] === 'function')) {
    throw new TypeError('createServer 需要完整的 lending service。');
  }

  async function route(req, res) {
    const path = pathWithoutQuery(req.url ?? '');
    const staticRoute = STATIC_ROUTES.get(path);
    const isHealth = path === '/api/health';
    const isState = path === '/api/state';
    const isBorrow = path === '/api/loans';
    const returnMatch = /^\/api\/loans\/([1-9]\d*)\/return$/.exec(path);
    if (!staticRoute && !isHealth && !isState && !isBorrow && !returnMatch) {
      sendError(res, 404, 'NOT_FOUND', '找不到此路徑。');
      return;
    }

    const expectedMethod = isHealth || isState || staticRoute ? 'GET' : 'POST';
    if (req.method !== expectedMethod) {
      sendError(res, 405, 'METHOD_NOT_ALLOWED', '此路徑不支援該 HTTP 方法。', {
        Allow: expectedMethod,
      });
      req.resume();
      return;
    }
    if (staticRoute) {
      await serveStatic(res, staticRoute);
      return;
    }
    if (isHealth) {
      sendJson(res, 200, { status: 'ok' });
      return;
    }
    if (isState) {
      sendJson(res, 200, service.report());
      return;
    }

    validateMutationOrigin(req);
    const body = await readRequestBody(req, res);
    if (body === null) {
      return;
    }
    if (isBorrow) {
      validateFields(body, ['equipmentId', 'borrowerId', 'days']);
      sendJson(res, 201, service.borrow(body));
      return;
    }
    validateFields(body, []);
    const loanId = Number(returnMatch[1]);
    if (!Number.isSafeInteger(loanId)) {
      throw new HttpError(404, 'LOAN_NOT_FOUND', '找不到指定借用紀錄。');
    }
    sendJson(res, 200, service.returnLoan(loanId));
  }

  return createHttpServer((req, res) => {
    route(req, res).catch((error) => {
      const mapped = mapLendingError(error);
      if (mapped) {
        sendError(res, mapped.status, mapped.code, mapped.message);
        return;
      }
      logError(error);
      if (res.headersSent) {
        res.destroy();
        return;
      }
      sendError(res, 500, 'INTERNAL_ERROR', '伺服器發生未預期的錯誤。');
    });
  });
}

function resolvePort(value) {
  if (value === undefined || value === '') {
    return DEFAULT_PORT;
  }
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const port = Number(value);
  return Number.isInteger(port) && port >= 0 && port <= 65535 ? port : null;
}

function start() {
  const port = resolvePort(process.env.PORT);
  if (port === null) {
    console.error(`PORT 必須是 0–65535 的整數：${JSON.stringify(process.env.PORT)}`);
    process.exitCode = 1;
    return;
  }

  const databasePath = resolve(process.env.DATABASE_PATH ?? 'data/equipment-demo.sqlite');
  let db;
  let reportDb;
  try {
    db = openDatabase(databasePath);
    reportDb = openDatabase(databasePath, { readOnly: true });
  } catch (error) {
    db?.close();
    reportDb?.close();
    console.error(`無法啟動設備借用服務：${error.message}`);
    process.exitCode = 1;
    return;
  }

  const server = createServer({
    service: createLendingService({ db, reportDb }),
  });
  server.on('error', (error) => {
    console.error(`無法監聽 ${HOST}:${port}：${error.message}`);
    process.exitCode = 1;
    reportDb.close();
    db.close();
  });
  server.listen(port, HOST, () => {
    console.log(`設備借用系統已啟動：http://${HOST}:${server.address().port}`);
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => {
        reportDb.close();
        db.close();
      });
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  start();
}

export { createServer };
