import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);
  let boxes: number[][] = input.map((m) => m.split(",").map(Number));
  const distances = calculateDistances(boxes);
  return solve(boxes, distances);
}

function calculateBoxDistance(a: number[], b: number[]) {
  let dx = b[0] - a[0];
  let dy = b[1] - a[1];
  let dz = b[2] - a[2];

  return dx * dx + dy * dy + dz * dz;
}

function calculateDistances(boxes: number[][]): number[][] {
  let distances: Map<string, number> = new Map();
  for (let a = 0; a < boxes.length; a++) {
    for (let b = 0; b < boxes.length; b++) {
      if (a === b) continue;
      const distance = calculateBoxDistance(boxes[a], boxes[b]);
      let id = `${Math.min(a, b)},${Math.max(a, b)}`;
      distances.set(id, distance);
    }
  }
  let t: number[][] = [];
  for (let [key, value] of distances) {
    t.push([...key.split(",").map(Number), value]);
  }
  t.sort((a: any, b: any) => a[2] - b[2]);
  return t;
}

function solve(boxes: number[][], distances: number[][]): [number, number] {
  let part1 = 0;
  let part2 = 0;
  const circuits: Set<number>[] = boxes.map((_, i) => new Set([i])); //[];
  const length = process.env.FILE === "test" ? 10 : 1000;

  for (let i = 0; i < 1_000_000; i++) {
    const data = distances[i];
    let a = Math.min(data[0], data[1]);
    let b = Math.max(data[0], data[1]);

    const circuitList = circuits.filter(
      (c) => c.has(data[0]) || c.has(data[1])
    );
    if (!circuitList) circuits.push(new Set([data[0], data[1]]));
    if (circuitList.length === 1) continue;
    else {
      const indexA = circuits.indexOf(circuitList[0]);
      const indexB = circuits.indexOf(circuitList[1]);
      const values = [...(circuitList[0] ?? []), ...(circuitList[1] ?? [])];
      circuits[indexA] = new Set(values);
      circuits.splice(indexB, 1);
      if (circuits.length === 1) {
        part2 = boxes[a][0] * boxes[b][0];
        break;
      }
    }

    if (i === length) {
      let circuitSizes = circuits.map((c) => c.size);
      circuitSizes.sort((a, b) => b - a);
      part1 = circuitSizes[0] * circuitSizes[1] * circuitSizes[2];
    }
  }
  return [part1, part2];
}
