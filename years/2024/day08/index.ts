import { join } from "path";
import { parseFileToGrid } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let grid = await parseFileToGrid(filePath);

  const antennas: Map<string, Vec2[]> = new Map();
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const key = grid[y][x];
      if (key === ".") continue;
      if (antennas.has(key)) {
        antennas.get(key)?.push(Vec2.create(x, y));
      } else {
        antennas.set(key, [Vec2.create(x, y)]);
      }
    }
  }

  let antinodesT1: Vec2[] = [];
  let antinodesT2: Vec2[] = [];

  for (let key of antennas.keys()) {
    const antennaList = antennas.get(key) || [];
    for (let antenna of antennaList) {
      for (let a of antennaList) {
        if (!Vec2.equals(antenna, a)) {
          antinodesT1.push(...getAntiNodes(antenna, a, false, 0));
          antinodesT2.push(...getAntiNodes(antenna, a, true, grid.length));
        }
      }
    }
  }

  const task1 = getDistictAntinodes(
    antinodesT1.filter((v) => !Vec2.outOfBoundsSquare(v, grid.length))
  ).length;
  const task2 = getDistictAntinodes(
    antinodesT2.filter((v) => !Vec2.outOfBoundsSquare(v, grid.length))
  ).length;

  return [task1, task2];
}

function getAntiNodes(
  a: Vec2,
  b: Vec2,
  addSteps: boolean,
  limit: number
): Vec2[] {
  const diff = Vec2.create(a.x - b.x, a.y - b.y);
  const n1 = Vec2.add(a, diff);
  const n2 = Vec2.add(b, Vec2.negate(diff));
  
  if (!addSteps) {
    return [n1, n2];
  }

  const stepSize = Vec2.subtract(a, n1);
  const steps: Vec2[] = [];
  let step = Vec2.copy(a);

  while (step.x >= 0 && step.x <= limit && step.y >= 0 && step.y <= limit) {
    step = Vec2.add(step, stepSize);
    steps.push(Vec2.copy(step));
  }

  return [n1, n2, ...steps];
}

function getDistictAntinodes(antinodes: Vec2[]): Vec2[] {
  const result: Vec2[] = [];
  for (const node of antinodes) {
    if (!result.some((existing) => Vec2.equals(existing, node))) {
      result.push(node);
    }
  }
  return result;
}
