import { join } from "path";
import {
  parseFileToString
} from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToString(filePath);

  const regex = /don't\(\)|do\(\)|mul\((\d+),(\d+)\)/g;
  const matches = Array.from(input.matchAll(regex));

  let task1 = 0;
  let task2 = 0;
  let enable = true;
  for (let match of matches) {
    if (match[0] === "do()") enable = true;
    else if (match[0] === "don't()") enable = false;
    else {
      const regex = /mul\((\d+),(\d+)\)/;
      const numbers = match[0].match(regex);
      if (!numbers) continue;
      const num1 = parseInt(numbers[1], 10);
      const num2 = parseInt(numbers[2], 10);
      const sum = num1 * num2;
      task1 += sum;
      task2 += enable === true ? sum : 0;
    }
  }

  return [task1, task2];
}