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

  let debugAntenas = [];
  for (let key of antennas.keys()) {
    for (let antenna of antennas.get(key) || []) {
      debugAntenas.push({ pos: antenna, char: key });
      antennas
        .get(key)!
        .filter((a) => !Vec2.equals(antenna, a))
        .forEach((a) => {
          antinodesT1 = [...antinodesT1, ...getAntiNodes(antenna, a, false, 0)];
          antinodesT2 = [
            ...antinodesT2,
            ...getAntiNodes(antenna, a, true, grid.length)
          ];
        });
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
  const center = Vec2.lerp(a, b, 0.5);
  const dist = Vec2.distanceTo(a, b);
  const angle = Math.atan2(a.y - b.y, a.x - b.x);

  const computePoint = (angleOffset: number): Vec2 => {
    const offsetAngle = angle + angleOffset;
    const x = center.x + Math.cos(offsetAngle) * dist * 1.5;
    const y = center.y + Math.sin(offsetAngle) * dist * 1.5;
    const v = Vec2.create(x, y);
    Vec2.round(v);
    Vec2.normalizeZero(v);
    return v;
  };

  const node1 = computePoint(0);
  const node2 = computePoint(Math.PI);
  const steps: Vec2[] = [];

  if (addSteps) {
    const stepX = a.x - node1.x;
    const stepY = a.y - node1.y;
    const stepSize = Vec2.create(stepX, stepY);

    let step = Vec2.copy(a);
    while (step.x >= 0 && step.x <= limit && step.y >= 0 && step.y <= limit) {
      step = Vec2.add(step, stepSize);
      steps.push(Vec2.copy(step));
    }
  }
  return [node1, node2, ...steps];
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
