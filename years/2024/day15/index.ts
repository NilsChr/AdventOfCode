import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { findCellsByValue } from "../../../helpers/gridHelpers";
import { sleep } from "../../../helpers/time";

class Robot {
  warehouse: Warehouse | null = null;
  pos: Vec2;

  constructor(x: number, y: number) {
    this.pos = Vec2.create(x, y);
  }

  move(dir: Vec2) {
    if (!this.warehouse) return;
    const next = Vec2.add(this.pos, dir);
    if (this.warehouse.map[next.y][next.x] === "#") return;

    const crate = this.warehouse.crates.find((c) => c.containsPoint(next));
    if (crate) {
      const canMoveCrate = crate.push(dir);
      if (canMoveCrate) {
        Vec2.addTo(this.pos, dir);
      }
    } else {
      Vec2.addTo(this.pos, dir);
    }
  }
}

class Crate {
  warehouse: Warehouse | null = null;
  pos: Vec2;
  width: number;

  constructor(x: number, y: number, width: number) {
    this.pos = Vec2.create(x, y);
    this.width = width;
  }

  push(dir: Vec2): boolean {
    if (!this.warehouse) return false;

    const chain = this.collectPushChain(dir);
    if (!chain) {
      return false;
    }

    for (const crate of chain) {
      Vec2.addTo(crate.pos, dir);
    }

    return true;
  }

  private collectPushChain(dir: Vec2): Crate[] | false {
    if (!this.warehouse) return false;

    const nextPos = Vec2.add(this.pos, dir);
    const nextEndPos = Vec2.create(nextPos.x + this.width - 1, nextPos.y);

    for (let x = nextPos.x; x <= nextEndPos.x; x++) {
      if (this.warehouse.map[nextPos.y][x] === "#") return false;
    }

    const cratesToPush: Crate[] = [this];
    for (let x = nextPos.x; x <= nextEndPos.x; x++) {
      const overlapPos = Vec2.create(x, nextPos.y);
      const nextCrate = this.warehouse.crates.find(
        (c) => c !== this && c.containsPoint(overlapPos)
      );

      if (nextCrate) {
        const subChain = nextCrate.collectPushChain(dir);
        if (!subChain) {
          return false;
        }

        for (const c of subChain) {
          if (!cratesToPush.includes(c)) {
            cratesToPush.push(c);
          }
        }
      }
    }

    return cratesToPush;
  }

  containsPoint(point: Vec2): boolean {
    return (
      this.pos.y === point.y &&
      point.x >= this.pos.x &&
      point.x < this.pos.x + this.width
    );
  }
}

class Warehouse {
  map: string[][];
  robot: Robot | null = null;
  crates: Crate[] = [];
  commands: string[] = [];

  constructor(map: string[][], commands: string[]) {
    this.map = map;
    this.commands = commands;
  }

  init(expand: boolean) {
    if (expand) {
      for (let i = 0; i < this.map.length; i++) {
        let line = "";
        for (let j = 0; j < this.map[i].length; j++) {
          const cell = this.map[i][j];
          if (cell === "#") line += "##";
          else if (cell === ".") line += "..";
          else if (cell === "@") line += "@.";
          else if (cell === "O") line += "O.";
        }
        this.map[i] = line.split("");
      }
    }

    const cratePositions = findCellsByValue(this.map, "O");
    const width = expand ? 2 : 1;
    for (let c of cratePositions) {
      this.addCrate(new Crate(c.x, c.y, width));
      for (let i = 0; i < width; i++) {
        this.map[c.y][c.x + i] = ".";
      }
    }

    const robotPos = findCellsByValue(this.map, "@")[0];
    this.addRobot(new Robot(robotPos.x, robotPos.y));
    this.map[robotPos.y][robotPos.x] = ".";
  }

  addRobot(robot: Robot) {
    this.robot = robot;
    this.robot.warehouse = this;
  }

  addCrate(crate: Crate) {
    crate.warehouse = this;
    this.crates.push(crate);
  }

  debug() {
    for (let y = 0; y < this.map.length; y++) {
      let line = "";
      for (let x = 0; x < this.map[y].length; x++) {
        const pos = Vec2.create(x, y);
        if (Vec2.equals(this.robot?.pos || Vec2.create(-1, -1), pos)) {
          line += "@";
        } else {
          const crate = this.crates.find((c) => c.containsPoint(pos));
          if (crate) {
            if (crate.width == 1) {
              line += "O";
            } else {
              line += "[]";
              x += crate.width - 1;
            }
          } else {
            line += this.map[y][x];
          }
        }
      }
      console.log(line);
    }
  }
}

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);
  let data = parseInput(input);

  const warehouse1 = new Warehouse(
    data.map.map((row) => row.slice()),
    [...data.commands]
  );
  warehouse1.init(false);
  runCommands(warehouse1, false);
  const task1 = warehouse1.crates.reduce(
    (acc, cur) => acc + (100 * cur.pos.y + cur.pos.x),
    0
  );

  const warehouse2 = new Warehouse(
    data.map.map((row) => row.slice()),
    [...data.commands]
  );
  warehouse2.init(true);
  runCommands(warehouse2, false);
  const task2 = warehouse2.crates.reduce(
    (acc, cur) => acc + (100 * cur.pos.y + cur.pos.x),
    0
  );

  return [task1, task2];
}

function parseInput(input: string[]): { map: string[][]; commands: string[] } {
  const map: string[][] = [];
  let commands: string[] = [];
  let parseCommands = false;
  for (const line of input) {
    if (line === "") parseCommands = true;
    if (parseCommands === false) {
      map.push(line.split(""));
    } else {
      commands = [...commands, ...line.split("")];
    }
  }

  return {
    map,
    commands
  };
}

async function runCommands(warehouse: Warehouse, debug: boolean) {
  for (let i = 0; i < warehouse.commands.length; i++) {
    const command = warehouse.commands[i];
    const moveDir = Vec2.create();
    if (command === "<") moveDir.x = -1;
    if (command === ">") moveDir.x = 1;
    if (command === "^") moveDir.y = -1;
    if (command === "v") moveDir.y = 1;

    const vel = Vec2.copy(moveDir);
    warehouse.robot?.move(vel);

    if (!debug) continue;
    console.clear();
    console.log();
    console.log("Command ", command);
    warehouse.debug();
    await sleep(500);
  }
}
