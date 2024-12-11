import { join } from "path";
import { parseFileToRows, parseFileToString } from "../../../helpers/fileParser";

let DEBUG = '';
let DEBUG_SEQUENCE = ''
let STONES = 0;

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToString(filePath);
  
  const cache = new Map<string, number>()
  let stones = input.split(' ').map(s => parseInt(s));
  let task1 = 0;
  let task2 = 0;
  for (let i = 0; i < stones.length; i++) {
    task1 += blink(stones[i], 25, cache);
    task2 += blink(stones[i], 75, cache);
  }

  return [task1, task2]
}

function blink(stone: number, blinkCount: number, cache: Map<string, number>): number {
  const key = `${stone}-${blinkCount}`;
  const stoneString = `${stone}`;
  if(cache.has(key)) return cache.get(key)!;
  const even = stoneString.length % 2 === 0;
  let result = 0;
  if (blinkCount === 0) result = 1;
  else if (stone === 0) {
    result = blink(1, blinkCount - 1, cache)
  }
  else if (even) {
    const firstNumber = parseInt(stoneString.substring(0, stoneString.length / 2))
    const secondNumber = parseInt(stoneString.substring(stoneString.length / 2, stoneString.length))
    result += blink(firstNumber, blinkCount - 1, cache);
    result += blink(secondNumber, blinkCount - 1, cache);
  } else {
    result = blink(stone * 2024, blinkCount - 1, cache);
  }

  cache.set(key, result);
  return result;
}