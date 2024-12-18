import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { createBoolGrid, createStringGrid, getNeighbourCoords } from "../../../helpers/gridHelpers";
import { debugGrid, waitForSpacePress } from "../../../helpers/debug";
import PriorityQueue from "../../../helpers/priorityQueue";


export async function run(dir: string): Promise<[number, number | string]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  const size = 70;
  const corruptionLimit = 1024;

  const positions: Vec2[] = [];
  for (let line of lines) {
    const parts = line.split(",");
    positions.push(Vec2.create(parseInt(parts[0]), parseInt(parts[1])));
  }

  let task1 = 0;
  let task2 = '';
  let corruption = 1;
  while (true) {
    const grid = createStringGrid(size + 1, size + 1, '.');
    for (let i = 0; i < positions.length; i++) {
      if (i > corruption) break;
      const pos = positions[i];
      grid[pos.y][pos.x] = '#'
    }
    const node = await findShortsPath(grid, Vec2.create(0, 0), Vec2.create(size, size));
    if (node === null && task2 === '') {
      task2 = Vec2.toString(positions[corruption]);
    }
    if (corruption === corruptionLimit && task1 === 0) {
      task1 = node?.steps || -1;
    }
    if (task1 !== 0 && task2 !== '') break;
    corruption++;
    if (corruption > positions.length) break;

  }


  return [task1, task2]
}

function t() {

}

type Node = {
  position: Vec2;
  steps: number;
  parent: Node | null;
};

async function findShortsPath(grid: string[][], start: Vec2, end: Vec2) {

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
      if (grid[n.y][n.x] === '#') continue;
      if (visited[n.y][n.x]) continue;
      queue.enqueue({ position: n, steps: current.steps + 1, parent: current })
      visited[n.y][n.x] = true;
    }
  }

  return null;
}