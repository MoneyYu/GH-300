import { formatInstantInTimeZone } from '/time.js';

const refs = {
  timezone: document.querySelector('#time-zone'),
  updatedAt: document.querySelector('#updated-at'),
  summary: document.querySelector('#summary'),
  equipmentList: document.querySelector('#equipment-list'),
  historyList: document.querySelector('#history-list'),
  historyCount: document.querySelector('#history-count'),
  historyEmpty: document.querySelector('#history-empty'),
  filter: document.querySelector('#status-filter'),
  message: document.querySelector('#operation-message'),
  refresh: document.querySelector('#refresh-button'),
};

const statusLabels = {
  available: '可借',
  borrowed: '借用中',
  overdue: '逾期',
  returned: '已歸還',
};
const statusNames = {
  all: '全部設備',
  available: '可借',
  borrowed: '借用中',
  overdue: '逾期',
};
const formValues = new Map();
const pendingEquipment = new Set();
const pendingLoans = new Set();
let report = null;
let requestVersion = 0;
let timeZone;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function localTime(instant) {
  try {
    return formatInstantInTimeZone(instant, timeZone);
  } catch {
    return '此瀏覽器不支援所需的時區格式';
  }
}

function setMessage(message, kind = '') {
  refs.message.textContent = message;
  refs.message.className = `message${kind ? ` message-${kind}` : ''}`;
}

function captureFormValues() {
  for (const form of refs.equipmentList.querySelectorAll('[data-borrow-form]')) {
    const data = new FormData(form);
    formValues.set(form.dataset.equipmentId, {
      borrowerId: String(data.get('borrowerId') ?? ''),
      days: String(data.get('days') ?? '7'),
    });
  }
}

function createSummaryCard(label, value, tone) {
  const card = node('article', `summary-card summary-${tone}`);
  card.append(node('span', 'summary-label', label));
  card.append(node('strong', 'summary-value', String(value)));
  return card;
}

function renderSummary() {
  refs.summary.replaceChildren(
    createSummaryCard('可借', report.summary.available, 'available'),
    createSummaryCard('借用中', report.summary.borrowed, 'borrowed'),
    createSummaryCard('逾期', report.summary.overdue, 'overdue'),
  );
}

function makeTimeLine(label, value) {
  const line = node('p', 'time-line');
  line.append(node('span', 'time-label', `${label}：`));
  line.append(node('time', '', localTime(value)));
  return line;
}

function createBorrowForm(item) {
  const form = node('form', 'borrow-form');
  form.dataset.borrowForm = '';
  form.dataset.equipmentId = item.equipmentId;
  const previous = formValues.get(item.equipmentId) ?? { borrowerId: '', days: '7' };

  const borrowerLabel = node('label', 'field');
  borrowerLabel.append(node('span', '', `借用人代號（${item.equipmentId}）`));
  const borrowerInput = node('input');
  borrowerInput.name = 'borrowerId';
  borrowerInput.type = 'text';
  borrowerInput.autocomplete = 'off';
  borrowerInput.required = true;
  borrowerInput.maxLength = 32;
  borrowerInput.pattern = '[A-Za-z0-9_-]{1,32}';
  borrowerInput.placeholder = '例如 DEMO-A';
  borrowerInput.value = previous.borrowerId;
  borrowerLabel.append(borrowerInput);

  const daysLabel = node('label', 'field field-days');
  daysLabel.append(node('span', '', '借用天數'));
  const daysInput = node('select');
  daysInput.name = 'days';
  for (let days = 1; days <= 14; days += 1) {
    const option = node('option', '', `${days} 天`);
    option.value = String(days);
    option.selected = String(days) === previous.days;
    daysInput.append(option);
  }
  daysLabel.append(daysInput);

  const canBorrow = item.status === 'available';
  const submit = node(
    'button',
    'button button-primary',
    pendingEquipment.has(item.equipmentId)
      ? '借用處理中…'
      : canBorrow ? '借用設備' : '目前不可借用',
  );
  submit.type = 'submit';
  submit.disabled = pendingEquipment.has(item.equipmentId) || !canBorrow;
  form.append(borrowerLabel, daysLabel, submit);
  form.addEventListener('input', () => {
    formValues.set(item.equipmentId, {
      borrowerId: borrowerInput.value,
      days: daysInput.value,
    });
  });
  form.addEventListener('submit', (event) => submitBorrow(event, item.equipmentId));
  return form;
}

function createEquipmentCard(item) {
  const card = node('article', `equipment-card equipment-${item.status}`);
  const top = node('div', 'equipment-top');
  const identity = node('div');
  identity.append(node('span', 'equipment-id', item.equipmentId));
  identity.append(node('h3', '', item.name));
  top.append(identity, node('span', `status-badge status-${item.status}`, statusLabels[item.status]));
  card.append(top);

  const loan = report.loans.find((entry) => entry.loanId === item.activeLoanId);
  if (!loan) {
    card.append(node('p', 'available-copy', '目前可借用。'));
  } else {
    const details = node('div', 'loan-details');
    details.append(node('p', 'borrower-line', `借用人代號：${loan.borrowerId}`));
    details.append(makeTimeLine('借出', loan.borrowedAt));
    details.append(makeTimeLine('到期', loan.dueAt));
    const returnButton = node(
      'button',
      'button button-secondary',
      pendingLoans.has(loan.loanId) ? '歸還處理中…' : '歸還設備',
    );
    returnButton.type = 'button';
    returnButton.disabled = pendingLoans.has(loan.loanId);
    returnButton.addEventListener('click', () => submitReturn(loan.loanId));
    details.append(returnButton);
    card.append(details);
  }
  card.append(createBorrowForm(item));
  return card;
}

function renderEquipment() {
  const status = refs.filter.value;
  const items = report.equipment.filter((item) => status === 'all' || item.status === status);
  const cards = items.map(createEquipmentCard);
  refs.equipmentList.replaceChildren(...cards);
  if (cards.length === 0) {
    refs.equipmentList.append(node('p', 'empty-state', `沒有符合「${statusNames[status]}」的設備。`));
  }
}

function historyCell(value) {
  const cell = node('td');
  cell.append(node('time', '', localTime(value)));
  return cell;
}

function renderHistory() {
  const history = report.loans.filter((loan) => loan.returnedAt !== null);
  refs.historyCount.textContent = `${history.length} 筆已歸還`;
  refs.historyEmpty.hidden = history.length > 0;
  const rows = history.map((loan) => {
    const row = node('tr');
    const equipmentCell = node('td');
    equipmentCell.append(node('strong', '', loan.equipmentId));
    equipmentCell.append(document.createTextNode(` · ${report.equipment.find((item) => item.equipmentId === loan.equipmentId)?.name ?? ''}`));
    row.append(
      equipmentCell,
      node('td', '', loan.borrowerId),
      historyCell(loan.borrowedAt),
      historyCell(loan.dueAt),
      historyCell(loan.returnedAt),
    );
    return row;
  });
  refs.historyList.replaceChildren(...rows);
}

function render() {
  if (!report) return;
  renderSummary();
  renderEquipment();
  renderHistory();
  refs.updatedAt.textContent = `資料更新時間：${localTime(report.asOf)}`;
}

async function readJson(response) {
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result?.error?.message ?? `HTTP ${response.status}`);
    error.code = result?.error?.code ?? 'REQUEST_FAILED';
    error.status = response.status;
    throw error;
  }
  return result;
}

async function refresh({ preserveMessage = false } = {}) {
  captureFormValues();
  const version = ++requestVersion;
  refs.refresh.disabled = true;
  try {
    const nextReport = await readJson(await fetch('/api/state', { headers: { Accept: 'application/json' } }));
    if (version !== requestVersion) return;
    report = nextReport;
    render();
    if (!preserveMessage) setMessage('');
  } catch (error) {
    if (version === requestVersion) {
      setMessage(`無法載入設備狀態：${error.message}`, 'error');
    }
  } finally {
    if (version === requestVersion) refs.refresh.disabled = false;
  }
}

async function submitBorrow(event, equipmentId) {
  event.preventDefault();
  const form = event.currentTarget;
  if (pendingEquipment.has(equipmentId)) return;
  const values = new FormData(form);
  const payload = {
    equipmentId,
    borrowerId: String(values.get('borrowerId') ?? '').trim(),
    days: Number(values.get('days')),
  };
  formValues.set(equipmentId, { borrowerId: payload.borrowerId, days: String(payload.days) });
  pendingEquipment.add(equipmentId);
  const version = ++requestVersion;
  renderEquipment();
  try {
    const loan = await readJson(await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    }));
    if (version === requestVersion) {
      formValues.delete(equipmentId);
      form.querySelector('[name="borrowerId"]').value = '';
      setMessage(`${loan.equipmentId} 已借給 ${loan.borrowerId}，到期時間為 ${localTime(loan.dueAt)}。`, 'success');
    }
  } catch (error) {
    if (version === requestVersion) {
      setMessage(error.status === 409
        ? `借用未完成：${error.message} 請重新整理後確認最新狀態。`
        : `借用未完成：${error.message}`, 'error');
    }
  } finally {
    pendingEquipment.delete(equipmentId);
    await refresh({ preserveMessage: true });
  }
}

async function submitReturn(loanId) {
  if (pendingLoans.has(loanId)) return;
  pendingLoans.add(loanId);
  const version = ++requestVersion;
  renderEquipment();
  try {
    const loan = await readJson(await fetch(`/api/loans/${loanId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: '{}',
    }));
    if (version === requestVersion) {
      setMessage(`${loan.equipmentId} 已歸還，歷史紀錄已保留。`, 'success');
    }
  } catch (error) {
    if (version === requestVersion) {
      setMessage(`歸還未完成：${error.message}`, 'error');
    }
  } finally {
    pendingLoans.delete(loanId);
    await refresh({ preserveMessage: true });
  }
}

function initializeTimeZone() {
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) throw new RangeError('目前環境未提供 IANA 時區。');
    new Intl.DateTimeFormat('en', { timeZone }).format(new Date());
    refs.timezone.textContent = timeZone;
  } catch {
    timeZone = null;
    refs.timezone.textContent = '此瀏覽器不支援 IANA 時區';
  }
}

refs.filter.addEventListener('change', renderEquipment);
refs.refresh.addEventListener('click', () => refresh());
initializeTimeZone();
refresh();
