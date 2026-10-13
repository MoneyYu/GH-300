// 教學錯誤版本（刻意 BUG 快照，不是正式實作）：
// 版本順序以原始 x.y.z 字串的字典序比較，因此 1.10.0 >=1.9.0 會被誤判為不符合。
// 正式 core／CLI 不得保留此行為；02-fixed 起改為逐片段數值比較。
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

  // BUG：字串字典序比較，'1.10.0' < '1.9.0'
  const order = version < target ? -1 : version > target ? 1 : 0;
  const satisfies =
    operator === '>=' ? order >= 0 :
    operator === '>' ? order > 0 :
    operator === '<=' ? order <= 0 :
    operator === '<' ? order < 0 :
    order === 0;

  console.log(`版本 ${version} ${satisfies ? '符合' : '不符合'}範圍 ${rangeText}`);
}

run(process.argv.slice(2));
