import { join } from "path";
import { parseFileToGrid } from "../../../helpers/fileParser";
import { createBoolGrid } from "../../../helpers/gridHelpers";
import { Vec2 } from "../../../helpers/vec2";

let directions: Vec2[] = [
  { x: 0, y: - 1 }, // Up
  { x: 0, y: 1 }, // Down
  { x: - 1, y: 0 }, // Left
  { x: 1, y: 0 }, // Right
];

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let grid = await parseFileToGrid(filePath);

  const visited = createBoolGrid(grid.length, grid[0].length);

  let task1 = 0;
  let task2 = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (visited[y][x]) continue;
      let costs = await scanArea(grid, visited, Vec2.create(x, y))
      task1 += costs[0];
      task2 += costs[1];

    }
  }

  return [task1, task2]
}

async function scanArea(grid: string[][], visited: boolean[][], from: Vec2): Promise<[number, number]> {
  const areaType = grid[from.y][from.x];
  //console.log(`Scan ${areaType} from ${from.x},${from.y}`);
  visited[from.y][from.x] = true;
  const queue: Vec2[] = [from];
  let area = 0;
  let perimeter = 0;

  let sides = 0;
  while (true) {
    const current = queue.pop();
    if (current === undefined) break;
    sides += countEdges(grid, current);
    area++;
    for (let dir of directions) {
      const check = Vec2.create(dir.x + current.x, dir.y + current.y);
      if (check.x < 0 || check.x > grid[0].length - 1 || check.y < 0 || check.y > grid.length - 1) {
        perimeter++;
        continue;
      }
      if (grid[check.y][check.x] !== areaType) {
        perimeter++;
        continue
      }
      if (visited[check.y][check.x]) continue;
      queue.push(check)
      visited[check.y][check.x] = true;
    }

  }
//  console.log(`Area ${areaType} areal = ${area}, perimeter = ${perimeter}, sides = ${sides}`);
  return [area * perimeter, area * sides];
}

function getNeighbour(grid: string[][], pos: Vec2, areaType: string): boolean {
  if (pos.y < 0 || pos.y >= grid.length || pos.x < 0 || pos.x >= grid[0].length) {
    return false;
  }
  return grid[pos.y][pos.x] === areaType;
}

function countEdges(grid: string[][], pos: Vec2): number {
  const directions = {
    left: Vec2.add(pos, Vec2.create(-1, 0)),
    right: Vec2.add(pos, Vec2.create(1, 0)),
    top: Vec2.add(pos, Vec2.create(0, -1)),
    bottom: Vec2.add(pos, Vec2.create(0, 1)),
    topLeft: Vec2.add(pos, Vec2.create(-1, -1)),
    topRight: Vec2.add(pos, Vec2.create(1, -1)),
    bottomLeft: Vec2.add(pos, Vec2.create(-1, 1)),
    bottomRight: Vec2.add(pos, Vec2.create(1, 1)),
  };

  let sides = 0;
  const areaType = grid[pos.y][pos.x];
  const hasLeft = getNeighbour(grid, directions.left, areaType);
  const hasTop = getNeighbour(grid, directions.top, areaType);
  const hasBottom = getNeighbour(grid, directions.bottom, areaType);
  const hasRight = getNeighbour(grid, directions.right, areaType);
  const hasTopLeft = getNeighbour(grid, directions.topLeft, areaType);
  const hasTopRight = getNeighbour(grid, directions.topRight, areaType);
  const hasBottomLeft = getNeighbour(grid, directions.bottomLeft, areaType);
  const hasBottomRight = getNeighbour(grid, directions.bottomRight, areaType);

  if (!hasTop && !hasLeft && !hasTopLeft) sides++;
  if (!hasTop && !hasRight && !hasTopRight) sides++;
  if (!hasBottom && !hasLeft && !hasBottomLeft) sides++;
  if (!hasBottom && !hasRight && !hasBottomRight) sides++;

  if (!hasBottom && !hasLeft && hasBottomLeft) sides++;
  if (!hasBottom && !hasRight && hasBottomRight) sides++;
  if (!hasTop && !hasLeft && hasTopLeft) sides++;
  if (!hasTop && !hasRight && hasTopRight) sides++;

  if (hasBottom && hasLeft && !hasBottomLeft) sides++;
  if (hasBottom && hasRight && !hasBottomRight) sides++;
  if (hasTop && hasLeft && !hasTopLeft) sides++;
  if (hasTop && hasRight && !hasTopRight) sides++;

  return sides;
}