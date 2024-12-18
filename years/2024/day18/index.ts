import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import {
  createBoolGrid,
  createStringGrid,
  getNeighbourCoords
} from "../../../helpers/gridHelpers";
import PriorityQueue from "../../../helpers/priorityQueue";

export async function run(dir: string): Promise<[number, number | string]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  const size = 70;
  const positions: Vec2[] = [];
  for (let line of lines) {
    const parts = line.split(",");
    positions.push(Vec2.create(parseInt(parts[0]), parseInt(parts[1])));
  }

  let task1 = checkPath(positions, 1024, size)?.steps || 0;

  let task2 = "";
  let corruption = 1;
  let min = 0;
  let max = positions.length;
  corruption = min + Math.floor((max - min) / 2);

  while (true) {
    const path = checkPath(positions, corruption, size);
    if (!path) {
      max = corruption;
      corruption = min + Math.floor((max - min) / 2);
    } else {
      min = corruption;
      corruption = min + Math.floor((max - min) / 2);
    }
    if (corruption === min || corruption === max) {
      task2 = Vec2.toString(positions[corruption]);
      break;
    }
  }

  return [task1, task2];
}

function checkPath(
  positions: Vec2[],
  corruption: number,
  size: number
): Node | null {
  const grid = createStringGrid(size + 1, size + 1, ".");
  for (let i = 0; i < corruption; i++) {
    const pos = positions[i];
    grid[pos.y][pos.x] = "#";
  }
  return findShortsPath(grid, Vec2.create(0, 0), Vec2.create(size, size));
}

type Node = {
  position: Vec2;
  steps: number;
  parent: Node | null;
};

function findShortsPath(grid: string[][], start: Vec2, end: Vec2) {
  const visited = createBoolGrid(grid.length, grid[0].length);
  const queue = new PriorityQueue<Node>((a, b) => a.steps - b.steps);
  queue.enqueue({ position: start, steps: 0, parent: null });
  visited[start.y][start.x] = true;

  while (true) {
    const current = queue.dequeue();
    if (!current) break;

    if (Vec2.equals(current.position, end)) {
      return current;
    }

    const neighbours = getNeighbourCoords(grid, current.position, false);
    for (let n of neighbours) {
      if (grid[n.y][n.x] === "#") continue;
      if (visited[n.y][n.x]) continue;
      queue.enqueue({ position: n, steps: current.steps + 1, parent: current });
      visited[n.y][n.x] = true;
    }
  }

  return null;
}
