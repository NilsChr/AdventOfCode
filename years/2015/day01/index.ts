import { join } from "path";
import {
  parseFileToRows,
  parseFileToString
} from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToString(filePath);

  let floor = 0;
  let visitedBasement = false;
  let task2 = 0;

  let i = 0;
  for (let c of input) {
    i++;
    if (c === "(") floor += 1;
    else floor -= 1;
    if (floor === -1 && visitedBasement === false) {
      task2 = i;
      visitedBasement = true;
    }
  }

  const task1 = floor;

  return [task1, task2];
}
