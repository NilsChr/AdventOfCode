import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

interface Calibration {
  control: number;
  input: number[];
}

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  let calibrations: Calibration[] = [];
  for (let line of input) {
    let parts = line.split(": ");
    calibrations.push({
      control: parseInt(parts[0]),
      input: parts[1].split(" ").map((i) => parseInt(i))
    });
  }

  let task1 = 0;
  let task2 = 0;
  for (let cal of calibrations) {
    task1 += runControl(cal, false) || 0;
    task2 += runControl(cal, true) || 0;
  }

  return [task1, task2];
}

function runControl(
  calibration: Calibration,
  useCombine: boolean
): number | undefined {
  const a = calculate(
    0,
    calibration.input[0],
    calibration.input,
    "add",
    calibration.control,
    useCombine
  );
  const b = calculate(
    0,
    calibration.input[0],
    calibration.input,
    "mult",
    calibration.control,
    useCombine
  );
  const c = useCombine
    ? calculate(
        0,
        calibration.input[0],
        calibration.input,
        "||",
        calibration.control,
        useCombine
      )
    : undefined;
  const correct = [a, b, c].find((n) => n === calibration.control);
  return correct;
}

function calculate(
  index: number,
  value: number,
  input: number[],
  operator: "add" | "mult" | "||",
  control: number,
  useCombine: boolean
): number | undefined {
  if (index >= input.length - 1) {
    if (value === control) return value;
    else return undefined;
  }
  const nextIndex = index + 1;
  let next = input[nextIndex];
  switch (operator) {
    case "add":
      value = value + next;
      break;
    case "mult":
      value = value * next;
      break;
    case "||":
      value = parseInt(`${value}${next}`);
  }
  const a = calculate(nextIndex, value, input, "mult", control, useCombine);
  const b = calculate(nextIndex, value, input, "add", control, useCombine);
  const c = useCombine
    ? calculate(nextIndex, value, input, "||", control, useCombine)
    : undefined;
  if (a !== undefined) return a;
  if (b !== undefined) return b;
  if (useCombine && c !== undefined) return c;
}
