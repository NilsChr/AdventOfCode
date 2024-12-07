import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  let left: number[] = [];
  let right: number[] = [];

  for (let line of lines) {
    let parts = line.split("   ");
    left.push(parseInt(parts[0]));
    right.push(parseInt(parts[1]));
  }

  left.sort();
  right.sort();

  let task1 = 0;
  let task2 = 0;

  const occurance = new Map<number, number>();

  for (let i = 0; i < left.length; i++) {
    task1 += Math.abs(left[i] - right[i]);
    occurance.set(right[i], (occurance.get(right[i]) || 0) + 1);
  }

  for (let i = 0; i < left.length; i++) {
    task2 += left[i] * (occurance.get(left[i]) || 0);
  }

  return [task1, task2];
}
