import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  let task1 = 0;
  let task2 = 0;
  for (let line of input) {
    let bank = line.split("");
    task1 += findHighestJoltage(bank, 2);
    task2 += findHighestJoltage(bank, 12);
  }

  return [task1, task2];
}

function findHighestJoltage(bank: string[], size: number): number {
  let out: string[] = [];
  let minPointer = 0;
  for (let digit = 0; digit < size; digit++) {
    if (bank.length === 1) {
      out.push(bank[0]);
      break;
    }
    let pointer = bank.length - (size - digit);

    let numbers: string[] = [];
    while (pointer >= 0) {
      numbers.push(bank[pointer]);
      pointer--;
    }
    let sorted = [...numbers].sort().reverse();
    minPointer = bank.indexOf(sorted[0]);
    out.push(bank[minPointer]);

    bank = bank.slice(minPointer + 1);
  }

  return parseInt(out.join(""));
}
