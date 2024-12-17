import { join } from "path";
import {
  parseFileToString
} from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToString(filePath);
  let {first, second} = splitInput(input);

  const task1 = runTask(input).size;
  const task2 = new Set([...runTask(first), ...runTask(second)]).size;

  return [task1, task2];
}

function runTask(input: string) {
  let uniquePos: Set<string> = new Set();
  let pos = Vec2.create(0, 0);
  uniquePos.add(Vec2.toString(pos));
  for (let i = 0; i < input.length; i++) {
    switch (input.charAt(i)) {
      case "<":
        Vec2.addTo(pos, Vec2.create(-1, 0));
        break;
      case ">":
        Vec2.addTo(pos, Vec2.create(1, 0));
        break;
      case "^":
        Vec2.addTo(pos, Vec2.create(0, -1));
        break;
      case "v":
        Vec2.addTo(pos, Vec2.create(0, 1));
        break;
    }
    uniquePos.add(Vec2.toString(pos));
  }
  return uniquePos;
}

function splitInput(input: string): { first: string; second: string } {
  let first = "";
  let second = "";
  for (let i = 0; i < input.length; i++) {
    if ((i + 1) % 2 === 0) {
      second += input[i];
    } else {
      first += input[i];
    }
  }
  return { first, second };
}
