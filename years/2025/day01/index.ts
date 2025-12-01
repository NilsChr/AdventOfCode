import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  const [task1, task2] = runTask1(input);

  return [task1, task2];
}

function runTask1(lines: string[]): number[] {
  let dial = 50;
  let password1 = 0;
  let password2 = 0;
  for (let line of lines) {
    let tempDial = dial;
    let dir = line[0];
    let n = parseInt(line.substring(1, line.length));
    let rest = n % 100;
    let hundreds = Math.floor(n / 100);

    let crossedZero = 0;

    if (dir === "L") tempDial -= rest;
    else tempDial += rest;

    if (tempDial < 0) {
      tempDial = 100 + tempDial;
      if (dial !== 0) crossedZero++;
    }
    if (tempDial > 100) {
      tempDial = tempDial % 100;
      if (dial !== 0) crossedZero++;
    }

    if (tempDial === 100) tempDial = 0;
    if (tempDial === 0) password1++;
    password2 += crossedZero + hundreds;
    dial = tempDial;
  }
  return [password1, password1 + password2];
}

function runTask1_debug(lines: string[]): number[] {
  let dial = 50;
  let password1 = 0;
  let password2 = 0;
  for (let line of lines) {
    let prevDial = dial;
    let tempDial = dial;
    let dir = line[0];
    let n = parseInt(line.substring(1, line.length));

    let hundreds = Math.floor(n / 100);
    let rest = n % 100;
    let crossedZero = 0;

    if (dir === "L") tempDial -= rest;
    else tempDial += rest;
    if (tempDial < 0) {
      tempDial = 100 + tempDial;
      if (dial !== 0) crossedZero++;
    }
    if (tempDial > 100) {
      tempDial = tempDial % 100;
      if (dial !== 0) crossedZero++;
    }
    if (tempDial === 100) tempDial = 0;
    if (tempDial === 0) password1++;
    crossedZero += hundreds;
    password2 += crossedZero;

    dial = tempDial;
    let zeroString =
      crossedZero > 0
        ? `during this rotation, it points at 0 ${crossedZero} times.`
        : "";
    console.log(
      `The dial ${prevDial} is rotated ${line} to point at ${dial}. ${zeroString}`
    );
  }
  return [password1, password1 + password2];
}
