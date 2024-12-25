import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  const blocks: string[][][] = [];
  let block: string[][] = [];
  for (let line of lines) {
    if (line === "") {
      blocks.push(block);
      block = [];
      continue;
    }

    block.push(line.split(""));
  }
  blocks.push(block);

  let keys: string[][][] = [];
  let locks: string[][][] = [];
  for (let block of blocks) {
    if (block[0].every((e) => e === "#")) {
      locks.push(block);
    } else keys.push(block);
  }

  let score = 0;
  for (let key of keys) {
    for (let lock of locks) {
      const keyHeight = getHeight(key);
      const lockHeight = getHeight(lock);
      const check: number[] = [];
      for (let i = 0; i < keyHeight.length; i++) {
        check.push(keyHeight[i] + lockHeight[i]);
      }
      score += check.every((n) => n <= 5) ? 1 : 0;
    }
  }

  const task1 = score;
  const task2 = 0;

  return [task1, task2];
}

function getHeight(block: string[][]): number[] {
  let heights = [0, 0, 0, 0, 0];
  for (let y = 0; y < block.length; y++) {
    for (let x = 0; x < block[0].length; x++) {
      heights[x] += block[y][x] === "#" ? 1 : 0;
    }
  }
  return heights.map((n) => n - 1);
}
