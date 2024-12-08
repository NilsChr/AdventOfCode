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

  let antinodesT1: Set<string> = new Set();
  let antinodesT2: Set<string> = new Set();

  for (let key of antennas.keys()) {
    const antennaList = antennas.get(key) || [];
    for (let antenna of antennaList) {
      for (let a of antennaList) {
        if (!Vec2.equals(antenna, a)) {
          getAntiNodes(antenna, a, grid.length, antinodesT1, antinodesT2);
        }
      }
    }
  }

  return [antinodesT1.size, antinodesT2.size];
}

function getAntiNodes(
  a: Vec2,
  b: Vec2,
  limit: number,
  t1: Set<string>,
  t2: Set<string>
) {
  const diff = Vec2.create(a.x - b.x, a.y - b.y);
  const n1 = Vec2.add(a, diff);
  const n2 = Vec2.add(b, Vec2.negate(diff));

  if (!Vec2.outOfBoundsSquare(n1, limit)) {
    t1.add(Vec2.toString(n1));
  }
  if (!Vec2.outOfBoundsSquare(n2, limit)) {
    t1.add(Vec2.toString(n2));
  }

  const stepSize = Vec2.subtract(a, n1);
  const steps: Vec2[] = [];
  let step = Vec2.copy(a);

  while (step.x >= 0 && step.x <= limit && step.y >= 0 && step.y <= limit) {
    step = Vec2.add(step, stepSize);
    steps.push(Vec2.copy(step));
    if (!Vec2.outOfBoundsSquare(step, limit)) {
      t2.add(Vec2.toString(step));
    }
  }
}