import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkCompatibility, CompatibilityInputError } from './core.js';

const HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;
const webDir = new URL('../web/', import.meta.url);

// 靜態檔只允許這四個固定路徑，檔名不由請求內容組成。
const STATIC_ROUTES = new Map([
  ['/', { file: 'index.html', type: 'text/html; charset=utf-8' }],
  ['/index.html', { file: 'index.html', type: 'text/html; charset=utf-8' }],
  ['/app.js', { file: 'app.js', type: 'text/javascript; charset=utf-8' }],
  ['/styles.css', { file: 'styles.css', type: 'text/css; charset=utf-8' }],
]);

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

function readParameter(params, name) {
  const values = params.getAll(name);
  if (values.length === 0) {
    return { error: ['MISSING_PARAMETER', `缺少查詢參數 ${name}。`] };
  }
  if (values.length > 1) {
    return { error: ['DUPLICATE_PARAMETER', `查詢參數 ${name} 不可重複。`] };
  }
  return { value: values[0] };
}

function handleCheck(res, query, check) {
  const params = new URLSearchParams(query);
  const version = readParameter(params, 'version');
  const range = readParameter(params, 'range');
  const failure = version.error ?? range.error;
  if (failure) {
    sendError(res, 400, ...failure);
    return;
  }

  try {
    sendJson(res, 200, check(version.value, range.value));
  } catch (error) {
    if (error instanceof CompatibilityInputError) {
      sendError(res, 400, error.code, error.message);
      return;
    }
    throw error;
  }
}

async function handleStatic(res, route) {
  const content = await readFile(new URL(route.file, webDir));
  res.writeHead(200, {
    'Content-Type': route.type,
    'Content-Length': content.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(content);
}

export function createServer({ check = checkCompatibility, logError = console.error } = {}) {
  async function route(req, res) {
    // 不用 new URL 解析請求目標，避免 //host/path 這類形式改變 pathname。
    const target = req.url ?? '';
    const queryStart = target.indexOf('?');
    const path = queryStart === -1 ? target : target.slice(0, queryStart);
    const query = queryStart === -1 ? '' : target.slice(queryStart + 1);

    const staticRoute = STATIC_ROUTES.get(path);
    const isApi = path === '/api/health' || path === '/api/check';
    if (!staticRoute && !isApi) {
      sendError(res, 404, 'NOT_FOUND', '找不到此路徑。');
      return;
    }
    if (req.method !== 'GET') {
      sendError(res, 405, 'METHOD_NOT_ALLOWED', '此路徑只支援 GET。', { Allow: 'GET' });
      return;
    }

    if (staticRoute) {
      await handleStatic(res, staticRoute);
    } else if (path === '/api/health') {
      sendJson(res, 200, { status: 'ok' });
    } else {
      handleCheck(res, query, check);
    }
  }

  return http.createServer((req, res) => {
    route(req, res).catch((error) => {
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
  const port = Number(value);
  return /^\d+$/.test(value) && port <= 65535 ? port : null;
}

function main() {
  const port = resolvePort(process.env.PORT);
  if (port === null) {
    console.error(`PORT 必須是 0–65535 的整數：${JSON.stringify(process.env.PORT)}`);
    return 1;
  }

  const server = createServer();
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `連接埠 ${port} 已被占用。本程式不會停止其他程序；請改用其他連接埠，例如：$env:PORT=3001; pnpm start`,
      );
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  });
  server.listen(port, HOST, () => {
    console.log(`版本相容性檢查已啟動：http://${HOST}:${server.address().port}`);
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => process.exit(0));
      server.closeAllConnections();
    });
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = main();
}
