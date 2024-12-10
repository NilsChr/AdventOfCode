import { join } from "path";
import { parseFileToGridOfType } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { createBoolGrid, getNeighbourCoords } from "../../../helpers/gridHelpers";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let grid = await parseFileToGridOfType<number>(filePath, (s => parseInt(s)));

  const starts = getStartPositions(grid);
  let task1 = 0;
  let task2 = 0;

  for (let start of starts) {
    const visited = createBoolGrid(grid.length, grid[0].length);
    task1 += countTrailheads(grid, start, visited);
    task2 += countTrailheads(grid, start, null);
  }

  return [task1, task2]
}

function getStartPositions(grid: number[][]): Vec2[] {
  const out: Vec2[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 0) {
        out.push(Vec2.create(x, y));
      }
    }
  }
  return out;
}

function countTrailheads(grid: number[][], pos: Vec2, visited: boolean[][] | null): number {
  const current = grid[pos.y][pos.x];
  if (current === 9) return 1;
  
  let count = 0;
  const next = current + 1;

  for (let n of getNeighbourCoords(grid, pos)) {
    if (grid[n.y][n.x] !== next || (visited && visited[n.y][n.x])) continue;
    if (visited) visited[n.y][n.x] = true; 
    count += countTrailheads(grid, n, visited); 
  }

  return count;
}
