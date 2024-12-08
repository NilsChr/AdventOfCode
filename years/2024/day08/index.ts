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
      const positions = antennas.get(key) ?? [];
      positions.push(Vec2.create(x, y));
      antennas.set(key, positions);
    }
  }

  const size = grid.length * grid.length;
  const antinodesT1_arr = new Uint8Array(size);
  const antinodesT2_arr = new Uint8Array(size);

  const limit = grid.length;
  for (const [_, antennaList] of antennas.entries()) {
    const length = antennaList.length;

    for (let i = 0; i < length; i++) {
      const a = antennaList[i];
      for (let j = i + 1; j < length; j++) {
        const b = antennaList[j];
        getAntiNodes(a, b, limit, antinodesT1_arr, antinodesT2_arr);
      }
    }
  }

  let task1 = 0;
  let task2 = 0;
  for (let i = 0; i < size; i++) {
    if (antinodesT1_arr[i] === 1) task1++;
    if (antinodesT2_arr[i] === 1) task2++;
  }

  return [task1, task2];
}

function getAntiNodes(
  a: Vec2,
  b: Vec2,
  limit: number,

  t1: Uint8Array,
  t2: Uint8Array
) {
  const diff = Vec2.create(a.x - b.x, a.y - b.y);
  const n1 = Vec2.add(a, diff);
  const n2 = Vec2.add(b, Vec2.negate(diff));

  if (!Vec2.outOfBoundsSquare(n1, limit)) {
    t1[n1.y * limit + n1.x] = 1;
  }
  if (!Vec2.outOfBoundsSquare(n2, limit)) {
    t1[n2.y * limit + n2.x] = 1;
  }

  const stepSize = Vec2.subtract(a, n1);
  let step = Vec2.copy(a);
  while (true) {
    step = Vec2.add(step, stepSize);
    if (Vec2.outOfBoundsSquare(step, limit)) break;
    t2[step.y * limit + step.x] = 1;
  }

  Vec2.negate(stepSize);
  step = Vec2.copy(b);
  while (true) {
    step = Vec2.add(step, stepSize);
    if (Vec2.outOfBoundsSquare(step, limit)) break;
    t2[step.y * limit + step.x] = 1;
  }
}
