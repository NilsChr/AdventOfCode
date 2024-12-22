import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { awaitKeyPress, KEY_CODE } from "../../../helpers/debug";
import { Vec2 } from "../../../helpers/vec2";
import { sleep } from "bun";
import { getNeighbourCoords } from "../../../helpers/gridHelpers";

//BEST <v<A>>^AvA^A<vA<AA>>^AAvA<^A>AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A
// <,A,>,A,v,<,<,A,A,>,^,A,A,>,A,v,A,A,^,A,<,v,A,A,A,>,^
// ^,A,<,<,^,^,A,>,>,A,v,v,v

//BAD  v<<A>^>AvA^Av<<A>^>AAv<A<A>^>AAvA^<Av>A^Av<A^>AA<A>Av<A<A>^>AAA<Av>A^A
// <,A,>,A,<,A,A,v,<,A,A,>,^,>,A,v,A,A,^,A,v,<,A,A,A,^,>
// ^,A,^,^,<,<,A,>,>,A,v,v,v

// <,A,>,A,v,<,<,A,A,>,^,A,A,>,A,v,A,A,^,A,<,v,A,A,A,>,^
// <,A,>,A,<,A,A,v,<,A,A,>,^,>,A,v,A,A,^,A,v,<,A,A,A,^,>

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  const level2 = new NumericKeypad("2nd", null);
  //const level2 = new ArrowKeypad("2nd", level3);
  const level1 = new ArrowKeypad("1st", level2);
  const root = new ArrowKeypad("root", level1);

  const keyboards = [root, level1, level2];

  const sequence: string[] = [];
  console.clear();

  let totalcost = 0;
  for (let line of lines) {
    totalcost += inputPassword(line, root, keyboards);
    keyboards.forEach((k) => k.reset());
  }
  let task1 = totalcost;

  //await inputPassword("379A", root, keyboards);

  //let task1 = 0;
  // [ "v", "<", "A", "<", "A", "A", ">", "^", ">", "A", "v", "A", "^", "<", "A", "v", ">", "A", "^", "A" ]
  //const s = root.getSequence("0") //level2.getSequence("7");
  //console.log(s);
  /*
  const s = getSequence(level2, "0"); //level2.getSequence("7");
  const s0 = getSequence(level1, s[0]) //level1.getSequence(s[0]);
  */
  //level1.debug();
  //console.log(s0);
  //console.log();
  //level2.debug();
  //console.log(s);

  /*
  let s = getSequence(level2, "0"); //root.getSequence("0");
  s = getSequence(level2, "A"); //root.getSequence("0");
  console.log(s);
  */

  /*
  const test =
    "<v<A>>^AvA^A<vA<AA>>^AAvA<^A>AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A";
   
 // const test = root.getSequence("0");
  //test.push("A")
  for (let t of test) {
    console.clear();
    for (let keyboard of keyboards) {
      keyboard.debug();
      console.log();
    }
    await sleep(50);
    root.executeCommand(t);
  }
    */
  /*
  const test2 = root.getSequence("2");
  test2.push("A");
  for (let t of test2) {
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
  // "<", "A", "<", "A", "<", "A", "v", "<", "<", "A", "v", "<", "<", "A", "A"
  /*
  while (true) {
    for (let keyboard of keyboards) {
      keyboard.debug();
      console.log();
    }
    const pressedKey = await getInput();
    sequence.push(pressedKey);
    console.clear();
    root.executeCommand(pressedKey);
    //console.log(`Key pressed ${pressedKey}`);
  }
    */

  const task2 = 0;

  return [task1, task2];
}

function inputPassword(
  code: String,
  root: Keypad,
  keyboards: Keypad[]
): number {
  let totalSequence = 0;
  for (let i = 0; i < code.length; i++) {
    const sequence = root.getSequence(code.charAt(i));
    if (i === code.length - 1) sequence.push("A");
    totalSequence += sequence.length;
    /*
    for (let t of sequence) {
      console.clear();
      console.log('input password: ', code.split("").join(","));
      for (let keyboard of keyboards) {
        keyboard.debug();
        console.log();
      }
      await sleep(500);
      root.executeCommand(t);
    }
      */
  }

  console.log(parseInt(code.replace("A", "")), " * ", totalSequence - 3);
  const cost: number = parseInt(code.replace("A", "")) * (totalSequence - 3);
  console.log(cost);
  return cost;
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
  type: string;
  buttons: string[][];
  position: Vec2;
  ghostPosition: Vec2; // ust this to "remember where you are" between fetches
  positions: Map<string, Vec2>;
  executeCommand(command: string): void;
  onEnter(): void; // Define the type of return value
  debug(): void;
  getSequence(target: string): string[];
  reset(): void;
  next: Keypad | null;
}

class NumericKeypad implements Keypad {
  type = "numeric";
  buttons: string[][] = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    [" ", "0", "A"]
  ];

  positions: Map<string, Vec2> = new Map();

  position: Vec2 = Vec2.create(2, 3);
  ghostPosition: Vec2 = Vec2.create(2, 3);

  next: Keypad | null;
  id: string;
  sequence: string[] = [];
  output: string[] = [];
  constructor(id: string, next: Keypad | null) {
    this.id = id;
    this.next = next;

    this.positions.set("7", Vec2.create(0, 0));
    this.positions.set("8", Vec2.create(1, 0));
    this.positions.set("9", Vec2.create(2, 0));
    this.positions.set("4", Vec2.create(0, 1));
    this.positions.set("5", Vec2.create(1, 1));
    this.positions.set("6", Vec2.create(2, 1));
    this.positions.set("1", Vec2.create(0, 2));
    this.positions.set("2", Vec2.create(1, 2));
    this.positions.set("3", Vec2.create(2, 2));
    this.positions.set("0", Vec2.create(1, 3));
    this.positions.set("A", Vec2.create(2, 3));
  }

  reset() {
    this.position = Vec2.create(2, 3);
    this.ghostPosition = Vec2.create(2, 3);
    this.output = [];
    this.sequence = [];
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
    this.ghostPosition = Vec2.copy(this.position);

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

  getSequence(target: string): string[] {
    return getSequence(this, target);
    /*
    if (!this.next) return [];
    const nextSequence = getSequence(this.next!, target);
    let sequence: string[] = [];

    for (let button of nextSequence) {
      const part = getSequence(this, button);
      sequence = [...sequence, ...part];
    }

    return sequence;
    */
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
  type = "arrow";

  buttons: string[][] = [
    [" ", "^", "A"],
    ["<", "v", ">"]
  ];

  positions: Map<string, Vec2> = new Map();
  position: Vec2 = Vec2.create(2, 0);
  ghostPosition: Vec2 = Vec2.create(2, 0);

  next: Keypad | null;
  id: string;
  sequence: string[] = [];
  constructor(id: string, next: Keypad | null) {
    this.id = id;
    this.next = next;

    this.positions.set("^", Vec2.create(1, 0));
    this.positions.set("A", Vec2.create(2, 0));
    this.positions.set("<", Vec2.create(0, 1));
    this.positions.set("v", Vec2.create(1, 1));
    this.positions.set(">", Vec2.create(2, 1));
  }

  reset() {
    this.position = Vec2.create(2, 0);
    this.ghostPosition = Vec2.create(2, 0);
    this.sequence = [];
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
    this.ghostPosition = Vec2.copy(this.position);
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

  getSequence(target: string): string[] {
    if (!this.next) return [];
    //console.log(`${this.id}Get sequence ${target}`);
    const nextSequence = this.next.getSequence(target); //getSequence(this.next!, target);
    //console.log(`${this.id} nextSequence -> ${nextSequence}`);
    let sequence: string[] = [];

    for (let button of nextSequence) {

        const part = getSequence(this, button);
        sequence = [...sequence, ...part];
      
      //console.log(`${this.id} button -> ${button}`);

      //console.log(`${this.id} part -> ${part}`);
    }
    //sequence.push('A');
    return sequence;
  }

  getHardcodedSequence(target: string) {
    const current = this.buttons[this.ghostPosition.y][this.ghostPosition.x];
    if (current === target) return [current];

    if (current === "<") {
      if (target === "v") return [">"];
      if (target === ">") return [">", ">"];
      if (target === "^") return [">", "^"];
      if (target === ">") return [">", ">", "^"];
    } else if (current === "v") {
      if (target === "<") return ["<"];
      if (target === ">") return [">"];
      if (target === "^") return ["^"];
      if (target === "A") return [">", "^"];
    } else if (current === ">") {
      if (target === "<") return ["<", "<"];
      if (target === "v") return ["<"];
      if (target === "^") return ["<", "^"];
      if (target === "A") return ["^"];
    } else if (current === "^") {
      if (target === "<") return ["v", "<"];
      if (target === "v") return ["v"];
      if (target === ">") return ["v", ">"];
      if (target === "A") return [">"];
    }else if (current === "A") {
      if (target === "<") return ["v", "<", "<"];
      if (target === "v") return ["v", "<"];
      if (target === ">") return ["v"];
      if (target === "^") return ["<"];
    }
    return []
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

function getSequence(keypad: Keypad, target: string): string[] {
  const targetPos = keypad.positions.get(target);
  if (!targetPos) {
    throw new Error("Cannot find target position");
  }

  const queue: { pos: Vec2; from: Vec2 | null }[] = [
    { pos: keypad.ghostPosition, from: null }
  ];
  const visited: { pos: Vec2; from: Vec2 | null }[] = [];
  let foundNode: { pos: Vec2; from: Vec2 | null } | null = null;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (Vec2.equals(current.pos, targetPos)) {
      foundNode = current;
      break;
    }

    visited.push(current);

    const neighbors = getNeighbourCoords(keypad.buttons, current.pos, false);
    for (const n of neighbors) {
      if (keypad.buttons[n.y][n.x] === " ") continue;
      if (visited.find((v) => Vec2.equals(v.pos, n))) continue;
      if (queue.find((q) => Vec2.equals(q.pos, n))) continue;
      queue.push({ pos: n, from: current.pos });
    }
  }

  if (!foundNode) return [];

  const path: Vec2[] = [];
  let currentNode = foundNode;
  while (currentNode) {
    path.push(currentNode.pos);
    if (currentNode.from === null) break;
    currentNode = visited.find((v) => Vec2.equals(v.pos, currentNode.from!))!;
  }
  path.reverse();

  let sequence: string[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const abs = Vec2.abs(path[i], path[i + 1]);
    /* if (Vec2.equals(abs, DIRS.LEFT)) sequence.push(">");
    if (Vec2.equals(abs, DIRS.RIGHT)) sequence.push("<");
    if (Vec2.equals(abs, DIRS.DOWN)) sequence.push("^");
    if (Vec2.equals(abs, DIRS.UP)) sequence.push("v"); */
    if (Vec2.equals(abs, DIRS.LEFT)) sequence.push(">");
    if (Vec2.equals(abs, DIRS.RIGHT)) sequence.push("<");
    if (Vec2.equals(abs, DIRS.DOWN)) sequence.push("^");
    if (Vec2.equals(abs, DIRS.UP)) sequence.push("v");
  }
  keypad.ghostPosition = path[path.length - 1];
  sequence.push("A");
  return sequence;
}

//  242716
function getSequence_(keypad: Keypad, target: string): string[] {
  const targetPos = keypad.positions.get(target);
  if (!targetPos) {
    throw new Error("Cannot find target position");
  }

  const costs = new Map<string, number>();
  const previous = new Map<string, Vec2 | null>();
  const queue: { pos: Vec2; cost: number }[] = [];

  const startKey = Vec2.toString(keypad.ghostPosition);
  costs.set(startKey, 0);
  queue.push({ pos: keypad.ghostPosition, cost: 0 });

  while (queue.length > 0) {
    // Sort the queue to find the node with the smallest cost
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;

    if (Vec2.equals(current.pos, targetPos)) {
      break;
    }

    const neighbors = getNeighbourCoords(keypad.buttons, current.pos, false);
    for (const n of neighbors) {
      if (keypad.buttons[n.y][n.x] === " ") continue; // Skip invalid buttons

      const neighborKey = Vec2.toString(n);
      const currentCost = costs.get(Vec2.toString(current.pos))!;
      const newCost = currentCost + 1; // All moves have a cost of 1

      if (!costs.has(neighborKey) || newCost < costs.get(neighborKey)!) {
        costs.set(neighborKey, newCost);
        previous.set(neighborKey, current.pos);
        queue.push({ pos: n, cost: newCost });
      }
    }
  }

  // Reconstruct the path
  const path: Vec2[] = [];
  let currentPos: Vec2 | null = targetPos;

  while (currentPos) {
    path.push(currentPos);
    const currentKey = Vec2.toString(currentPos);
    currentPos = previous.get(currentKey) || null;
  }

  if (path.length === 0) return [];

  path.reverse();

  // Generate the sequence
  const sequence: string[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const abs = Vec2.abs(path[i], path[i + 1]);
    if (Vec2.equals(abs, DIRS.LEFT)) sequence.push(">");
    if (Vec2.equals(abs, DIRS.RIGHT)) sequence.push("<");
    if (Vec2.equals(abs, DIRS.DOWN)) sequence.push("^");
    if (Vec2.equals(abs, DIRS.UP)) sequence.push("v");
  }

  keypad.ghostPosition = path[path.length - 1];
  sequence.push("A");
  return sequence;
}

/*

Get TO 0


root: v < A < A A
1st: v < < A > > ^ A
2nd: < A




*/
