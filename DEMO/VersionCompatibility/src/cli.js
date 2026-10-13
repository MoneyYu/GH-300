import { checkCompatibility, CompatibilityInputError } from './core.js';

function main(args) {
  if (args.length !== 2) {
    console.error('用法：node src\\cli.js <version> <range>');
    return 1;
  }

  let result;
  try {
    result = checkCompatibility(args[0], args[1]);
  } catch (error) {
    if (error instanceof CompatibilityInputError) {
      console.error(`輸入錯誤 [${error.code}]：${error.message}`);
      return 1;
    }
    throw error;
  }

  console.log(`版本 ${result.version} ${result.satisfies ? '符合' : '不符合'}範圍 ${result.range}`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
