import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string) {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  const task1 = 0;
  const task2 = 0;

  console.log("Task 1:", task1);
  console.log("Task 2:", task2);
}
