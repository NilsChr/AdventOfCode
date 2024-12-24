import { join } from "path";
import {
  parseFileToString
} from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToString(filePath);

  const [a, b] = input.split("\n\n");

  const initialValues = new Map<string, number>();
  for (let v of a.split("\n")) {
    const [key, value] = v.split(": ");
    initialValues.set(key, parseInt(value));
  }

  const commands: { a: string; b: string; op: string; target: string }[] = [];
  for (let v of b.split("\n")) {
    const [a, op, b, _, target] = v.split(" ");
    commands.push({ a, b, op, target });
  }

  commands.forEach((v) => {
    const a = initialValues.get(v.a);
    const b = initialValues.get(v.b);
    switch (v.op) {
      case "OR":
        initialValues.set(v.target, a! | b!);
        break;
      case "XOR":
        initialValues.set(v.target, a! ^ b!);
        break;
      case "AND":
        initialValues.set(v.target, a! && b!);
        break;
    }
  });

  const outputs = new Map<string, number>();

  let prevBin = "";
  while (true) {
    commands.forEach((v) => {
      const a = initialValues.get(v.a);
      const b = initialValues.get(v.b);
      switch (v.op) {
        case "OR":
          outputs.set(v.target, a! | b!);
          initialValues.set(v.target, a! | b!);

          break;
        case "XOR":
          outputs.set(v.target, a! ^ b!);
          initialValues.set(v.target, a! ^ b!);

          break;
        case "AND":
          outputs.set(v.target, a! && b!);
          initialValues.set(v.target, a! && b!);
          break;
      }
     // if (!outputs.get(v.target)) undefindesFound = true;
     // if (!initialValues.get(v.target)) undefindesFound = true;

    });
    let binary = ""
    const keys = [...outputs.keys()].sort();
    for (let key of keys) {
      if (key.charAt(0) === "z") binary += outputs.get(key);
    }
    if(prevBin === binary) break;
    prevBin = binary;
  }

  commands.forEach((v) => {
    const a = initialValues.get(v.a);
    const b = initialValues.get(v.b);
    switch (v.op) {
      case "OR":
        outputs.set(v.target, a! | b!);
        initialValues.set(v.target, a! | b!);

        break;
      case "XOR":
        outputs.set(v.target, a! ^ b!);
        initialValues.set(v.target, a! ^ b!);

        break;
      case "AND":
        outputs.set(v.target, a! && b!);
        initialValues.set(v.target, a! && b!);
        break;
    }
   // if (!outputs.get(v.target)) undefindesFound = true;
   // if (!initialValues.get(v.target)) undefindesFound = true;

  });

  let task1 = "";
  const keys = [...outputs.keys()].sort();
  for (let key of keys) {
    if (key.charAt(0) === "z") task1 += outputs.get(key);
  }

  task1 = task1.split('').reverse().join('');
  const task2 = 0;

  return [parseInt(task1,2), task2];
}