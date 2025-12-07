import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  let splitters: Vec2[] = [];
  let start: Vec2 = Vec2.create(0, 0);
  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      if (input[y][x] === "S") {
        start.x = x;
        start.y = y;
      } else if (input[y][x] === "^") {
        splitters.push(Vec2.create(x, y));
      }
    }
  }
  splitters.sort((a, b) => a.y - b.y);

  let cache: Map<string, number> = new Map();
  let colSet: Set<string> = new Set();
  let score = getScore(start, splitters, cache, colSet)

  const task1 = colSet.size;
  const task2 = score;

  return [task1, task2];
}

function getScore(pos: Vec2, splitters: Vec2[], cache: Map<string, number>, colSet: Set<string>): number {
  let key = `${pos.x},${pos.y}`
  if(cache.has(key)) return cache.get(key)!;
  let col = checkRay(pos, splitters);
  if (!col) return 1;
  colSet.add(`${col.x},${col.y}`)
  let score = getScore(Vec2.create(col.x - 1, col.y), splitters,cache, colSet) +getScore(Vec2.create(col.x + 1, col.y), splitters,cache,colSet)
  cache.set(key,score);
  return score
}

function checkRay(rayStart: Vec2, splitters: Vec2[]): Vec2 | null {
  for (let i = 0; i < splitters.length; i++) {
    if (splitters[i].x === rayStart.x && splitters[i].y > rayStart.y)
      return splitters[i];
  }
  return null;
}
