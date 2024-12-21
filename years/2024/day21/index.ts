import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { awaitKeyPress, KEY_CODE } from "../../../helpers/debug";
import { Vec2 } from "../../../helpers/vec2";
import { sleep } from "bun";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  const level2 = new NumericKeypad("2rd", null);
  //const level2 = new ArrowKeypad("2nd", level3);
  const level1 = new ArrowKeypad("1st", level2);
  const root = new ArrowKeypad("root", level1);

  const keyboards = [root, level1, level2];

  const sequence: string[] = [];
  console.clear();

  /*
  const test =
    "<vA<AA>>^AvAA<^A>A<v<A>>^AvA^A<vA>^A<v<A>^A>AAvA^A<v<A>A>^AAAvA<^A>A";
  for (let t of test) {
    console.clear();
    for (let keyboard of keyboards) {
      keyboard.debug();
      console.log();
    }
    await sleep(250);
    root.executeCommand(t);
  }
    */

  // MANUAL DEBUG
  while (true) {

    for(let keyboard of keyboards) {
      keyboard.debug();
      console.log();
    }
    const pressedKey = await getInput();
    sequence.push(pressedKey);
    console.clear();
    root.executeCommand(pressedKey);
    //console.log(`Key pressed ${pressedKey}`);
  }
  

  const task1 = 0;
  const task2 = 0;

  return [task1, task2];
}

async function getInput(): Promise<string> {
  const pressedKey = await awaitKeyPress([
    KEY_CODE.ARROW_DOWN,
    KEY_CODE.ARROW_LEFT,
    KEY_CODE.ARROW_RIGHT,
    KEY_CODE.ARROW_UP,
    KEY_CODE.SPACE,
    KEY_CODE.ENTER
  ]);

  switch (pressedKey) {
    case KEY_CODE.ARROW_UP:
      return "^";
    case KEY_CODE.ARROW_DOWN:
      return "v";
    case KEY_CODE.ARROW_LEFT:
      return "<";
    case KEY_CODE.ARROW_RIGHT:
      return ">";
    case KEY_CODE.SPACE:
      return "A";
    case KEY_CODE.ENTER:
      return "A";
    default:
      return "unknown";
  }
}

const DIRS = {
  LEFT: Vec2.create(-1, 0),
  RIGHT: Vec2.create(1, 0),
  UP: Vec2.create(0, -1),
  DOWN: Vec2.create(0, 1)
};

interface Keypad {
  executeCommand(command: string): void;
  onEnter(): void; // Define the type of return value
  debug(): void;
  next: Keypad | null;
}

class NumericKeypad implements Keypad {
  buttons: string[][] = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    [" ", "0", "A"]
  ];

  position: Vec2 = Vec2.create(2, 3);
  next: Keypad | null;
  id: string;
  sequence: string[] = [];
  output: string[] = [];
  constructor(id: string, next: Keypad | null) {
    this.id = id;
    this.next = next;
  }

  executeCommand(command: string) {
    this.sequence.push(command);
    switch (command) {
      case "<":
        Vec2.addTo(this.position, DIRS.LEFT);
        break;
      case ">":
        Vec2.addTo(this.position, DIRS.RIGHT);
        break;
      case "^":
        Vec2.addTo(this.position, DIRS.UP);
        break;
      case "v":
        Vec2.addTo(this.position, DIRS.DOWN);
        break;
      case "A":
        this.onEnter();
        break;
      case "A":
        this.onEnter();
        break;
    }

    if (
      this.position.x < 0 ||
      this.position.x > this.buttons[0].length - 1 ||
      this.position.y < 0 ||
      this.position.y > this.buttons.length - 1
    )
      throw new Error("Key PANIC");

    if (this.buttons[this.position.y][this.position.x] === null)
      throw new Error("Key PANIC");
  }

  onEnter() {
    this.output.push(this.buttons[this.position.y][this.position.x]);
    if (this.next) {
      console.log("COMMAND");
      this.next.executeCommand(this.buttons[this.position.y][this.position.x]);
    }
  }

  debug() {
    const RESET = "\x1b[0m";
    const GREEN = "\x1b[32m";

    console.log(this.id);
    console.log(`Sequence: `, this.sequence.join(","));
    console.log(`Output: `, this.output.join(","));
    this.buttons.forEach((row, rowIndex) => {
      const line = row
        .map((button, colIndex) => {
          if (this.position.x === colIndex && this.position.y === rowIndex) {
            return `${GREEN}${button ?? " "}${RESET}`; // Highlight current position
          }
          return button ?? " ";
        })
        .join(" ");
      console.log(line);
    });
  }
}

class ArrowKeypad implements Keypad {
  buttons: string[][] = [
    [" ", "^", "A"],
    ["<", "v", ">"]
  ];

  position: Vec2 = Vec2.create(2, 0);

  next: Keypad | null;
  id: string;
  sequence: string[] = [];
  constructor(id: string, next: Keypad | null) {
    this.id = id;
    this.next = next;
  }

  executeCommand(command: string) {
    this.sequence.push(command);
    switch (command) {
      case "<":
        Vec2.addTo(this.position, DIRS.LEFT);
        break;
      case ">":
        Vec2.addTo(this.position, DIRS.RIGHT);
        break;
      case "^":
        Vec2.addTo(this.position, DIRS.UP);
        break;
      case "v":
        Vec2.addTo(this.position, DIRS.DOWN);
        break;
      case "A":
        this.onEnter();
        break;
      case "A":
        this.onEnter();
        break;
    }

    if (
      this.position.x < 0 ||
      this.position.x > this.buttons[0].length - 1 ||
      this.position.y < 0 ||
      this.position.y > this.buttons.length - 1
    )
      throw new Error("Key PANIC");

    if (this.buttons[this.position.y][this.position.x] === null)
      throw new Error("Key PANIC");
  }

  onEnter() {
    if (this.next) {
      this.next.executeCommand(this.buttons[this.position.y][this.position.x]);
    }
  }

  debug() {
    const RESET = "\x1b[0m";
    const GREEN = "\x1b[32m";

    console.log(this.id);
    console.log(`Sequence: `, this.sequence.join(","));
    this.buttons.forEach((row, rowIndex) => {
      const line = row
        .map((button, colIndex) => {
          if (this.position.x === colIndex && this.position.y === rowIndex) {
            return `${GREEN}${button ?? " "}${RESET}`; // Highlight current position
          }
          return button ?? " ";
        })
        .join(" ");
      console.log(line);
    });
  }
}




/*

Get TO 0


root: v < A < A A
1st: v < < A > > ^ A
2nd: < A




*/