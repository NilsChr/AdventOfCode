import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import {
  doesPolygonContain,
  isPointInOrOnPolygon,
} from "../../../helpers/polygon";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);
  let boxes: number[][] = input.map((m) => m.split(",").map(Number));

  return calculateAreas(boxes);
}

function calculateArea(a: number[], b: number[]) {
  let dx = Math.abs(b[0] - a[0]) + 1;
  let dy = Math.abs(b[1] - a[1]) + 1;
  return dx * dy;
}

function calculateAreas(boxes: number[][]): [number, number] {
  let task1: number[] = [];
  let task2: number[] = [];

  const len = boxes.length;

  for (let a = 0; a < len - 1; a++) {
    for (let b = a + 1; b < len; b++) {
      const box = pointsToBox(boxes[a], boxes[b]);
      const area = calculateArea(boxes[a], boxes[b]);

      if (!doesPolygonContain(boxes, box)) {
        task1.push(area);
      } else {
        task2.push(area);
      }
    }
  }

  task1.sort((a, b) => b - a);
  task2.sort((a, b) => b - a);

  const max1 = task1[0] || 0;
  const max2 = task2[0] || 0;

  return [max1, max2];
}

function pointsToBox(p1: number[], p2: number[]): number[][] {
  const x1 = p1[0],
    y1 = p1[1];
  const x2 = p2[0],
    y2 = p2[1];

  return [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2],
  ];
}

interface debugBox {
  data: number[][];
  sign: string;
}
function debug(boxes: number[][], debugBox: debugBox[]) {
  for (let y = 0; y < 9; y++) {
    let line = "";
    for (let x = 0; x < 14; x++) {
      let cell = ".";
      let b = boxes.find((b) => b[0] === x && b[1] === y);
      if (isPointInOrOnPolygon([x, y], boxes)) cell = "X";
      if (b) cell = "#";
      debugBox.forEach((db) => {
        if (isPointInOrOnPolygon([x, y], db.data)) {
          cell = db.sign;
        }
      });

      line += cell;
    }
    console.log(line);
  }
}
