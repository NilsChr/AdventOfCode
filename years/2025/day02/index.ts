import { join } from "path";
import { parseFileToString } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToString(filePath);

  return check(input);
}

function check(input: string): [number, number] {
  const pairs = input.split(",");
  let task1 = 0;
  let task2 = 0;
  for (let pair of pairs) {
    const values = pair.split("-").map(Number)
    for (let i = values[0]; i <= values[1]; i++) {
      const value = i;
      if (!isValidId(value, value.toString().length / 2)) {
        task1 += value;
      }
      if (!isValidId(value, 1)) {
        task2 += value;
      }
    }
  }
  return [task1, task2];
}
function isValidId(input: number, windowSize: number): boolean {
  const asString = input.toString();

  while (windowSize < asString.length) {
    let windows = getWindows(asString, windowSize);
    if (windows.every((v) => v === windows[0])) return false;
    windowSize++;
  }

  return true;
}

function getWindows(input: string, windowSize: number): string[] {
  let out: string[] = [];
  for(let i = 0; i < input.length; i += windowSize) {
    out.push(input.substring(i, i + windowSize));
  }
  return out;
}