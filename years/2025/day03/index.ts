import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  let task1 = 0;
  let task2 = 0;
  for (let line of input) {
    let temp = findHighestJoltage(line, 12);
    task1 += parseInt(findHighestJoltage(temp, 2));
    task2 += parseInt(temp);
  }

  return [task1, task2];
}

function findHighestJoltage(bank: string, size: number): string {
  let out: string = '';
  let startIndex = 0;
  for (let digit = 0; digit < size; digit++) {
    let pointer = startIndex;
    let highestNumber = "0";
    let highestNumberIndex = -1;

    while (pointer < bank.length - (size - digit - 1)) {
      if (bank[pointer] > highestNumber) {
        highestNumberIndex = pointer;
        highestNumber = bank[pointer];
      }
      pointer++;
      if (highestNumber === "9") break;
    }
    startIndex = highestNumberIndex + 1;
    out += highestNumber;
  }
  return out;
}
