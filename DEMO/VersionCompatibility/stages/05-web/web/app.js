const form = document.querySelector('#check-form');
const versionInput = document.querySelector('#version');
const rangeInput = document.querySelector('#range');
const checkButton = document.querySelector('#check');
const result = document.querySelector('#result');
const error = document.querySelector('#error');

let controller = null;
let requestId = 0;

function render(element, state, title, detail) {
  element.dataset.state = state;
  const heading = document.createElement('strong');
  heading.textContent = title;
  const text = document.createElement('span');
  text.textContent = detail;
  element.replaceChildren(heading, text);
}

function clearOutcome() {
  result.hidden = false;
  result.dataset.state = 'idle';
  result.textContent = '尚未檢查。';
  error.hidden = true;
  error.dataset.state = 'none';
  error.replaceChildren();
}

function showResult(state, title, detail) {
  error.hidden = true;
  error.dataset.state = 'none';
  error.replaceChildren();
  result.hidden = false;
  render(result, state, title, detail);
}

function showError(state, title, detail) {
  result.hidden = true;
  result.dataset.state = 'idle';
  result.replaceChildren();
  error.hidden = false;
  render(error, state, title, detail);
}

function setPending(pending) {
  checkButton.disabled = pending;
  checkButton.textContent = pending ? '檢查中…' : '檢查';
  form.setAttribute('aria-busy', String(pending));
}

// 輸入或範例改變時，作廢進行中的請求，讓舊回應不會覆蓋新輸入。
function cancelPending() {
  requestId += 1;
  if (controller) {
    controller.abort();
    controller = null;
  }
  setPending(false);
}

async function submit() {
  if (controller) {
    return;
  }
  const id = requestId + 1;
  requestId = id;
  controller = new AbortController();
  setPending(true);

  const query = new URLSearchParams({ version: versionInput.value, range: rangeInput.value });
  try {
    const response = await fetch(`/api/check?${query}`, { signal: controller.signal });
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (id !== requestId) {
      return;
    }

    if (response.ok && body && typeof body.satisfies === 'boolean') {
      const satisfies = body.satisfies;
      showResult(
        satisfies ? 'match' : 'mismatch',
        satisfies ? '符合' : '不符合',
        `版本 ${body.version} ${satisfies ? '符合' : '不符合'}範圍 ${body.range}`,
      );
    } else if (response.status === 400 && body && body.error) {
      showError('input-error', '輸入錯誤', `[${body.error.code}] ${body.error.message}`);
    } else {
      showError('network-error', '網路錯誤', `檢查服務回應異常（HTTP ${response.status}），請稍後重試。`);
    }
  } catch {
    if (id === requestId) {
      showError('network-error', '網路錯誤', '無法連線到本機檢查服務，請確認 server 已啟動後重試。');
    }
  } finally {
    if (id === requestId) {
      controller = null;
      setPending(false);
    }
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  submit();
});

for (const input of [versionInput, rangeInput]) {
  input.addEventListener('input', () => {
    cancelPending();
    clearOutcome();
  });
}

for (const button of document.querySelectorAll('.example')) {
  button.addEventListener('click', () => {
    cancelPending();
    clearOutcome();
    versionInput.value = button.dataset.version;
    rangeInput.value = button.dataset.range;
    submit();
  });
}
