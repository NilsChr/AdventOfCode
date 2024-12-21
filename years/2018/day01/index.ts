import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  let task1 = 0;
  let task2: number | undefined = undefined;

  let score = 0;
  let i = 0;
  let loop = 0;
  const values = new Set<number>();
  values.add(0);
  while (true) {
    score = eval(`${score}${lines[i]}`);

    if (loop === 0 && i === lines.length - 1) {
      task1 = score;
    }

    if (values.has(score) && task2 === undefined) {
      task2 = score;
      break;
    }
    values.add(score);

    i++;
    if (i >= lines.length) {
      loop++;
      i = 0;
    }
  }

  return [task1, task2!];
}
