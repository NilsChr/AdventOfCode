import { join } from "path";
import { parseFileToGrid } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let grid = await parseFileToGrid(filePath);
  let task1 = 0;
  let task2 = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x] === "X") task1 += scanTask1(grid, x, y);
      else if (grid[y][x] === "A") task2 += scanTask2(grid, x, y);
    }
  }
  return [task1, task2];
}

function scanTask1(grid: string[][], x: number, y: number): number {
  const dirs = [
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1]
  ];
  const target = "XMAS";
  let score = 0;
  for (let d = 0; d < dirs.length; d++) {
    let word = "X";
    const dir = dirs[d];
    for (let step = 1; step < target.length; step++) {
      let dx = x + dir[0] * step;
      let dy = y + dir[1] * step;
      if (dx < 0 || dx > grid[0].length - 1 || dy < 0 || dy > grid.length - 1) {
        continue;
      }
      const letter = grid[dy][dx];
      if (letter !== target.charAt(step)) continue;
      word += grid[dy][dx];
      if (word === target) score++;
    }
  }
  return score;
}

function scanTask2(grid: string[][], x: number, y: number): number {
  if (
    x - 1 < 0 ||
    x + 1 > grid[0].length - 1 ||
    y - 1 < 0 ||
    y + 1 > grid.length - 1
  ) {
    return 0;
  }

  let topLeft = grid[y - 1][x - 1] + grid[y][x] + grid[y + 1][x + 1];
  let bottomLeft = grid[y - 1][x + 1] + grid[y][x] + grid[y + 1][x - 1];
  const correct =
    (topLeft === "MAS" || topLeft === "SAM") &&
    (bottomLeft === "MAS" || bottomLeft === "SAM");
  return correct ? 1 : 0;
}
