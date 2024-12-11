import { join } from "path";
import { parseFileToString } from "../../../helpers/fileParser";

const cache = new Map<string, number>()
const splitCache = new Map<string, { firstHalf: number, secondHalf: number }>()
export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToString(filePath);

  let stones = input.split(' ').map(s => parseInt(s));
  let task1 = 0;
  let task2 = 0;
  for (let i = 0; i < stones.length; i++) {
    task1 += blink(stones[i], 25);
    task2 += blink(stones[i], 75);
  }

  return [task1, task2]
}

function blink(stone: number, blinkCount: number): number {
  const key = `${stone}-${blinkCount}`;
  const stoneStr = `${stone}`;
  if (cache.has(key)) return cache.get(key)!;
  const even = stoneStr.length % 2 === 0;
  const nextBlink = blinkCount - 1;
  let result = 0;
  if (blinkCount === 0) result = 1;
  else if (stone === 0) {
    result = blink(1, nextBlink)
  }
  else if (even) {
    if (splitCache.has(stoneStr)) {
      const split = splitCache.get(stoneStr)!;
      result += blink(split.firstHalf, nextBlink);
      result += blink(split.secondHalf, nextBlink);
    } else {
      const halfString = stoneStr.length / 2;
      const firstHalf = parseInt(stoneStr.substring(0, halfString))
      const secondHalf = parseInt(stoneStr.substring(halfString, stoneStr.length))
      result += blink(firstHalf, nextBlink);
      result += blink(secondHalf, nextBlink);
      splitCache.set(stoneStr, { firstHalf, secondHalf });
    }
  } else {
    result = blink(stone * 2024, nextBlink);
  }

  cache.set(key, result);
  return result;
}