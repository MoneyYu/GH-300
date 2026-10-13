// 02-fixed：修正 01-buggy 的字串字典序 BUG，改為逐片段數值比較；其餘行為不變，仍是單一 function。
function run(args) {
  if (args.length !== 2) {
    console.error('用法：node src\\cli.js <version> <range>');
    process.exitCode = 1;
    return;
  }

  const stable = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
  const version = args[0].trim();
  const rangeText = args[1].trim();

  if (!stable.test(version) || !version.split('.').every((part) => Number.isSafeInteger(Number(part)))) {
    console.error(`輸入錯誤 [INVALID_VERSION]：版本必須是完整穩定的 x.y.z，各片段不得有前導零或超過 ${Number.MAX_SAFE_INTEGER}：${JSON.stringify(args[0])}`);
    process.exitCode = 1;
    return;
  }

  const match = /^(>=|<=|>|<|=)?(.*)$/s.exec(rangeText);
  const operator = match[1] ?? '=';
  const target = match[2];

  if (!stable.test(target) || !target.split('.').every((part) => Number.isSafeInteger(Number(part)))) {
    console.error(`輸入錯誤 [INVALID_RANGE]：範圍必須是單一條件（=、>、>=、<、<=）加完整穩定的 x.y.z：${JSON.stringify(args[1])}`);
    process.exitCode = 1;
    return;
  }

  // 逐片段數值比較 major、minor、patch
  const left = version.split('.').map(Number);
  const right = target.split('.').map(Number);
  const index = left.findIndex((part, i) => part !== right[i]);
  const order = index === -1 ? 0 : left[index] < right[index] ? -1 : 1;
  const satisfies =
    operator === '>=' ? order >= 0 :
    operator === '>' ? order > 0 :
    operator === '<=' ? order <= 0 :
    operator === '<' ? order < 0 :
    order === 0;

  console.log(`版本 ${version} ${satisfies ? '符合' : '不符合'}範圍 ${rangeText}`);
}

run(process.argv.slice(2));
