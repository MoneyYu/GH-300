import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { checkCompatibility } from '../src/core.js';
import { createServer } from '../src/server.js';

const serverPath = fileURLToPath(new URL('../src/server.js', import.meta.url));
const webDir = new URL('../web/', import.meta.url);

async function withServer(run, options) {
  const server = createServer(options);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { address, port } = server.address();
  try {
    return await run(`http://${address}:${port}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

async function getJson(base, path, init) {
  const response = await fetch(base + path, init);
  return { response, body: await response.json() };
}

function check(version, range) {
  return `/api/check?version=${encodeURIComponent(version)}&range=${encodeURIComponent(range)}`;
}

test('importing the module does not start listening', async () => {
  // Arrange
  const server = createServer();

  // Act & Assert
  assert.equal(server.listening, false);
  server.close();
});

test('GET /api/health returns status ok', async () => {
  await withServer(async (base) => {
    // Act
    const { response, body } = await getJson(base, '/api/health');

    // Assert
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /^application\/json/);
    assert.deepEqual(body, { status: 'ok' });
  });
});

test('GET /api/check returns the core result with 200 including false', async () => {
  await withServer(async (base) => {
    // Act
    const match = await getJson(base, check('1.10.0', '>=1.9.0'));
    const mismatch = await getJson(base, check('1.9.0', '>=1.10.0'));

    // Assert
    assert.equal(match.response.status, 200);
    assert.deepEqual(match.body, { version: '1.10.0', range: '>=1.9.0', satisfies: true });
    assert.equal(mismatch.response.status, 200);
    assert.deepEqual(mismatch.body, { version: '1.9.0', range: '>=1.10.0', satisfies: false });
  });
});

test('GET /api/check delegates to the same checkCompatibility core', async () => {
  const cases = [
    ['1.3.0', '^1.2.3'],
    ['2.0.0', '^1.2.3'],
    ['1.2.9', '~1.2.3'],
    ['1.3.0', '~1.2.3'],
    ['1.2.4-beta.1', '^1.2.3'],
    ['1.2.3+build.1', '=1.2.3'],
    ['  1.2.3  ', ' >=1.0.0 '],
  ];
  await withServer(async (base) => {
    for (const [version, range] of cases) {
      // Act
      const { response, body } = await getJson(base, check(version, range));

      // Assert
      assert.equal(response.status, 200, `${version} ${range}`);
      assert.deepEqual(body, checkCompatibility(version, range), `${version} ${range}`);
    }
  });
});

test('GET /api/check uses the injected check function rather than its own logic', async () => {
  const calls = [];
  const check = (version, range) => {
    calls.push([version, range]);
    return { version, range, satisfies: false };
  };
  await withServer(
    async (base) => {
      // Act
      const { body } = await getJson(base, '/api/check?version=1.0.0&range=%3E%3D9.9.9');

      // Assert
      assert.deepEqual(calls, [['1.0.0', '>=9.9.9']]);
      assert.deepEqual(body, { version: '1.0.0', range: '>=9.9.9', satisfies: false });
    },
    { check },
  );
});

test('GET /api/check rejects missing parameters with 400', async () => {
  await withServer(async (base) => {
    for (const path of [
      '/api/check',
      '/api/check?version=1.2.3',
      '/api/check?range=%3E%3D1.0.0',
      '/api/check?other=1',
    ]) {
      // Act
      const { response, body } = await getJson(base, path);

      // Assert
      assert.equal(response.status, 400, path);
      assert.equal(body.error.code, 'MISSING_PARAMETER', path);
      assert.equal(typeof body.error.message, 'string', path);
      assert.deepEqual(Object.keys(body), ['error'], path);
    }
  });
});

test('GET /api/check rejects duplicate parameters with 400', async () => {
  await withServer(async (base) => {
    for (const path of [
      '/api/check?version=1.2.3&version=1.2.4&range=%3E%3D1.0.0',
      '/api/check?version=1.2.3&range=%3E%3D1.0.0&range=%3C2.0.0',
    ]) {
      // Act
      const { response, body } = await getJson(base, path);

      // Assert
      assert.equal(response.status, 400, path);
      assert.equal(body.error.code, 'DUPLICATE_PARAMETER', path);
    }
  });
});

test('GET /api/check maps core input errors to 400 with their codes', async () => {
  await withServer(async (base) => {
    // Act
    const badVersion = await getJson(base, check('1.02.3', '>=1.0.0'));
    const emptyVersion = await getJson(base, check('', '>=1.0.0'));
    const badRange = await getJson(base, check('1.2.3', '1.x'));
    const emptyRange = await getJson(base, check('1.2.3', ''));

    // Assert
    assert.equal(badVersion.response.status, 400);
    assert.equal(badVersion.body.error.code, 'INVALID_VERSION');
    assert.equal(emptyVersion.response.status, 400);
    assert.equal(emptyVersion.body.error.code, 'INVALID_VERSION');
    assert.equal(badRange.response.status, 400);
    assert.equal(badRange.body.error.code, 'INVALID_RANGE');
    assert.equal(emptyRange.response.status, 400);
    assert.equal(emptyRange.body.error.code, 'INVALID_RANGE');
    assert.equal(typeof badRange.body.error.message, 'string');
  });
});

test('unknown paths return 404 JSON without reading arbitrary files', async () => {
  await withServer(async (base) => {
    for (const path of [
      '/nope',
      '/api',
      '/api/',
      '/api/health/',
      '/api/unknown',
      '/package.json',
      '/src/core.js',
      '/web/app.js',
      '/../package.json',
      '/%2e%2e/package.json',
      '/..%2fpackage.json',
      '//api/health',
      '/APP.JS',
      '/app.js/',
    ]) {
      // Act
      const response = await fetch(base + path);

      // Assert
      assert.equal(response.status, 404, path);
      assert.match(response.headers.get('content-type'), /^application\/json/, path);
      assert.equal((await response.json()).error.code, 'NOT_FOUND', path);
    }
  });
});

test('known paths reject non-GET methods with 405 and an Allow header', async () => {
  await withServer(async (base) => {
    for (const path of ['/', '/index.html', '/app.js', '/styles.css', '/api/health', '/api/check']) {
      for (const method of ['POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']) {
        // Act
        const response = await fetch(base + path, { method });

        // Assert
        assert.equal(response.status, 405, `${method} ${path}`);
        assert.equal(response.headers.get('allow'), 'GET', `${method} ${path}`);
        if (method !== 'HEAD') {
          assert.equal((await response.json()).error.code, 'METHOD_NOT_ALLOWED', `${method} ${path}`);
        }
      }
    }
  });
});

test('unknown paths stay 404 even for non-GET methods', async () => {
  await withServer(async (base) => {
    // Act
    const response = await fetch(base + '/nope', { method: 'POST' });

    // Assert
    assert.equal(response.status, 404);
  });
});

test('static allowlist serves the four web files with correct content types', async () => {
  const expected = [
    ['/', 'index.html', /^text\/html; charset=utf-8$/],
    ['/index.html', 'index.html', /^text\/html; charset=utf-8$/],
    ['/app.js', 'app.js', /^text\/javascript; charset=utf-8$/],
    ['/styles.css', 'styles.css', /^text\/css; charset=utf-8$/],
  ];
  await withServer(async (base) => {
    for (const [path, file, type] of expected) {
      // Act
      const response = await fetch(base + path);

      // Assert
      assert.equal(response.status, 200, path);
      assert.match(response.headers.get('content-type'), type, path);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff', path);
      assert.equal(await response.text(), await readFile(new URL(file, webDir), 'utf8'), path);
    }
  });
});

test('static routes ignore the query string', async () => {
  await withServer(async (base) => {
    // Act
    const response = await fetch(`${base}/?scoutTheme=dark`);

    // Assert
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /^text\/html/);
  });
});

test('unexpected errors return 500 without leaking details and are logged to stderr', async () => {
  const logged = [];
  const secret = 'secret-internal-detail';
  await withServer(
    async (base) => {
      // Act
      const response = await fetch(base + check('1.2.3', '>=1.0.0'));
      const text = await response.text();

      // Assert
      assert.equal(response.status, 500);
      assert.deepEqual(JSON.parse(text).error.code, 'INTERNAL_ERROR');
      assert.ok(!text.includes(secret));
      assert.ok(!text.includes(' at '));
      assert.equal(logged.length, 1);
      assert.match(String(logged[0]), new RegExp(secret));
    },
    {
      check: () => {
        throw new Error(secret);
      },
      logError: (error) => logged.push(error),
    },
  );
});

test('the web files are local-only and use theme tokens for colors', async () => {
  // Arrange
  const [html, js, css] = await Promise.all(
    ['index.html', 'app.js', 'styles.css'].map((file) => readFile(new URL(file, webDir), 'utf8')),
  );
  const componentCss = css
    .replace(/:root\s*\{[^}]*\}/, '')
    .replace(/html\[data-theme="dark"\]\s*\{[^}]*\}/, '');

  // Assert
  for (const source of [html, js, css]) {
    assert.doesNotMatch(source, /https?:\/\//);
  }
  assert.match(html, /<script>[\s\S]*scoutTheme[\s\S]*<\/script>[\s\S]*src="\/app\.js"/);
  assert.match(css, /--cp-accent:\s*#b11f4b/);
  assert.match(css, /html\[data-theme="dark"\]/);
  assert.doesNotMatch(componentCss, /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/);
  assert.match(componentCss, /var\(--cp-/);
});

function startChild(env) {
  const child = spawn(process.execPath, [serverPath], {
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => (stdout += chunk));
  child.stderr.setEncoding('utf8').on('data', (chunk) => (stderr += chunk));
  const exited = new Promise((resolve) => child.on('exit', (code) => resolve(code)));
  return { child, exited, output: () => ({ stdout, stderr }) };
}

async function waitFor(predicate, message) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(message);
}

test('running the file listens on 127.0.0.1 with PORT and reports the actual address', async () => {
  // Arrange
  const { child, exited, output } = startChild({ PORT: '0' });
  try {
    // Act
    await waitFor(() => /http:\/\/127\.0\.0\.1:\d+/.test(output().stdout), 'server did not start');
    const url = /http:\/\/127\.0\.0\.1:\d+/.exec(output().stdout)[0];
    const response = await fetch(`${url}/api/health`);

    // Assert
    assert.deepEqual(await response.json(), { status: 'ok' });
  } finally {
    child.kill();
    await exited;
  }
});

test('running the file reports an occupied port without touching the other listener', async () => {
  // Arrange
  const blocker = createServer();
  await new Promise((resolve) => blocker.listen(0, '127.0.0.1', resolve));
  const { port } = blocker.address();
  const { exited, output } = startChild({ PORT: String(port) });

  try {
    // Act
    const code = await exited;

    // Assert
    assert.equal(code, 1);
    assert.match(output().stderr, new RegExp(`${port}`));
    assert.match(output().stderr, /PORT/);
    assert.equal(blocker.listening, true);
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
  } finally {
    blocker.closeAllConnections();
    await new Promise((resolve) => blocker.close(resolve));
  }
});

test('running the file rejects an invalid PORT value', async () => {
  // Arrange
  const { exited, output } = startChild({ PORT: 'abc' });

  // Act
  const code = await exited;

  // Assert
  assert.equal(code, 1);
  assert.match(output().stderr, /PORT/);
});
