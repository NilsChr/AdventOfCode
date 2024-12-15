import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { findCellsByValue } from "../../../helpers/gridHelpers";
import { debugGrid } from "../../../helpers/debug";

interface Warehouse {
  map: string[][];
  commands: string[];
  robot: Vec2;
}

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);
  const warehouse = parseInput(input);
  await runCommands(warehouse);
  const task1 = findCellsByValue(warehouse.map, "O").reduce((acc, cur) => acc + (100 * cur.x + cur.y),0);
  const task2 = 0;

  return [task1, task2];
}

function parseInput(input: string[]): Warehouse {
  const warehouse: Warehouse = {
    map: [],
    commands: [],
    robot: Vec2.create()
  };
  let y = 0;
  let parseCommands = false;
  for (const line of input) {
    if (line === "") parseCommands = true;
    if(parseCommands === false) {
      warehouse.map.push(line.split(""));
      let x = line.indexOf("@");
      if (x > 0) {
        warehouse.robot.x = x;
        warehouse.robot.y = y;
      }
      y++;
    } else {
      warehouse.commands = [...warehouse.commands, ...line.split("")];

    }
  }

  return warehouse;
}

async function runCommands(warehouse: Warehouse) {
  for (let i = 0; i < warehouse.commands.length; i++) {
    const command = warehouse.commands[i];
    runMove(warehouse, command);
  }
}

async function runMove(warehouse: Warehouse, command: string) {
  const moveDir = Vec2.create();
  if (command === "<") moveDir.x = -1;
  if (command === ">") moveDir.x = 1;
  if (command === "^") moveDir.y = -1;
  if (command === "v") moveDir.y = 1;

  const vel = Vec2.copy(moveDir);
  const start = Vec2.copy(warehouse.robot);

  const next = Vec2.add(start, vel);
  if (warehouse.map[next.y][next.x] === "#") return;
  if (warehouse.map[next.y][next.x] === ".") {
    warehouse.map[next.y][next.x] = "@";
    warehouse.map[start.y][start.x] = ".";
    Vec2.addTo(warehouse.robot, vel);
    return;
  }
  if (warehouse.map[next.y][next.x] === "O") {
    const next = findNextAvailableSpot(warehouse, moveDir);
    if (next.position === null) return;
    const rev = Vec2.normalizeZero(Vec2.negate(moveDir));
    const last = Vec2.copy(next.position);
    const secondLast = Vec2.add(last, rev);
    for (let i = 0; i < next.distance; i++) {
      const temp = warehouse.map[secondLast.y][secondLast.x];
      warehouse.map[secondLast.y][secondLast.x] = warehouse.map[last.y][last.x];
      warehouse.map[last.y][last.x] = temp;
      Vec2.addTo(last, rev);
      Vec2.addTo(secondLast, rev);
    }
    Vec2.addTo(warehouse.robot, vel);
    return;
  }
}

function findNextAvailableSpot(
  warehouse: Warehouse,
  dir: Vec2
): { position: Vec2 | null; distance: number } {
  let position: Vec2 | null = Vec2.copy(warehouse.robot);
  let distance = 0;
  while (true) {
    const next = Vec2.add(position, dir);
    if (warehouse.map[next.y][next.x] === "#") break;
    Vec2.addTo(position, dir);
    distance++;
    if (warehouse.map[next.y][next.x] === ".") {
      break;
    }
  }
  if (warehouse.map[position.y][position.x] === "O") {
    position = null;
  }
  return { position, distance };
}

async function debug(warehouse: Warehouse, command: string, next: Vec2 | null) {
  console.log(`Move ${command}`);
  const debugPos = [];
  if (next) {
    debugPos.push({ pos: next, char: "X" });
  }

  debugGrid(warehouse.map, debugPos, false);
}
