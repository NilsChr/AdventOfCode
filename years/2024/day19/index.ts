import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  const patterns = input[0]
    .split(",")
    .map((s) => s.trim())
    .sort((a, b) => b.length - a.length);
  const carpets = input.slice(2);

  let task1 = 0;
  let task2 = 0;

  for (let carpet of carpets) {
    const score = solve(carpet, patterns);
    if (score !== 0) task1++;
    task2 += score;
  }

  return [task1, task2];
}

function solve(
  carpet: string,
  patterns: string[],
  cache: Map<string, number> = new Map()
): number {
  if (cache.has(carpet)) return cache.get(carpet)!;
  if (carpet.length === 0) return 1;
  let result = 0;

  for (let pattern of patterns) {
    if (carpet.startsWith(pattern)) {
      result += solve(carpet.slice(pattern.length), patterns, cache);
    }
  }
  cache.set(carpet, result);

  return cache.get(carpet)!;
}
