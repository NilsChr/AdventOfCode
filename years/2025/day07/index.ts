import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  let start = Vec2.create();
  for (let i = 0; i < input[0].length; i++) {
    if (input[0][i] === "S") {
      start.x = i;
      break;
    }
  }
  const splitters = getCollisionPoints(input, start);

  let cache: Map<string, number> = new Map();
  let score = getScore(start, splitters, cache);

  const task1 = splitters.values().reduce((sum, arr) => {
    return sum + arr.length;
  }, 0);
  const task2 = score;

  return [task1, task2];
}

function getScore(
  pos: Vec2,
  splitters: Map<number, number[]>,
  cache: Map<string, number>
): number {
  let key = `${pos.x},${pos.y}`;
  if (cache.has(key)) return cache.get(key)!;
  let col = checkRay(pos, splitters);
  if (!col) return 1;
  let score =
    getScore(Vec2.create(col.x - 1, col.y), splitters, cache) +
    getScore(Vec2.create(col.x + 1, col.y), splitters, cache);
  cache.set(key, score);
  return score;
}

function checkRay(
  rayStart: Vec2,
  splitters: Map<number, number[]>
): Vec2 | null {
  let yList = splitters.get(rayStart.x) ?? [];
  for (let i = 0; i < yList.length; i++) {
    if (yList[i] > rayStart.y) {
      return Vec2.create(rayStart.x, yList[i]);
    } 
  }
  return null;
}

function getCollisionPoints(
  input: string[],
  start: Vec2
): Map<number, number[]> {
  let out: Map<number, number[]> = new Map();
  let currentXList: number[] = [start.x];

  for (let y = 1; y < input.length; y++) {
    let nextXs: Set<number> = new Set();

    for (let x of currentXList) {
      if (input[y][x] === "^") {
        let arr = out.get(x);
        if (!arr) {
          arr = [];
          out.set(x, arr);
        }
        arr.push(y);
        nextXs.add(x - 1);
        nextXs.add(x + 1);
      } else {
        nextXs.add(x);
      }
    }
    currentXList = [...nextXs];
  }

  return out;
}