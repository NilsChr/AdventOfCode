import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { extractIntegers } from "../../../helpers/regexHelpers";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  let task1 = 0;
  let task2 = 0;
  for (let line of lines) {
    const numbers = extractIntegers(line).sort((a, b) => a - b);
    let lw = numbers[0] * numbers[1];
    let wh = numbers[1] * numbers[2];
    let lh = numbers[2] * numbers[0];
    let smallest = Math.min(lw, wh, lh);
    let sum1 = 2 * lw + 2 * wh + 2 * lh + smallest;
    task1 += sum1;

    let ribbon = 2 * (numbers[0] + numbers[1]);
    let bow = numbers[0] * numbers[1] * numbers[2];
    let sum2 = ribbon + bow;
    task2 += sum2;
  }

  return [task1, task2];
}
