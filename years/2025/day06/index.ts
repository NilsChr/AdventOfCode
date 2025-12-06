import { join } from "path";
import { parseFileToGrid, parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  let operators = input[input.length - 1];
  let columns: number[][] = [];
  for (let i = 1; i < operators.length; i++) {
    if (operators[i] === " ") continue;
    if (columns.length === 0) {
      let length = i - 1;
      columns.push([0, length]);
    } else {
      const lastColumn = columns[columns.length - 1];
      const columnStart = lastColumn[0] + lastColumn[1] + 1;
      columns.push([columnStart, i - 1 - columnStart]);
    }
  }
  const lastColumn = columns[columns.length - 1];
  const columnStart = lastColumn[0] + lastColumn[1] + 1;
  columns.push([columnStart, input[0].length - columnStart]);


  let matrixes: string[][][] = [];
  for (let column of columns) {
    let matrix: string[][] = [];
    for (let i = 0; i < input.length - 1; i++) {
      let line = input[i];
      const sub = line.substring(column[0], column[0] + column[1]);
      matrix.push(sub.split(""));
    }
    matrixes.push(matrix);
  }

  let task1 = 0;
  let task2 = 0;

  for (const [index, matrix] of matrixes.entries()) {
    const operator = operators[columns[index][0]];
    task1 += sumMatrix(matrix, operator);
    task2 += sumMatrixRotated(matrix, operator);
  }

  return [task1, task2];
}

function sumMatrix(matrix: string[][], operator: string): number {
  let sum = parseInt(matrix[0].join(""));
  for (let y = 1; y < matrix.length; y++) {
    const value = parseInt(matrix[y].join(""));
    if (operator === "+") {
      sum += value;
    } else sum *= value;
  }
  return sum;
}

function sumMatrixRotated(matrix: string[][], operator: string): number {
  let sum = 0;
  for (let x = matrix[0].length - 1; x >= 0; x--) {
    let digit: string = "";
    for (let y = 0; y < matrix.length; y++) {
      digit += matrix[y][x];
    }
    let n = parseInt(digit);
    if (sum === 0) sum = n;
    else {
      if (operator === "+") {
        sum += n;
      } else sum *= n;
    }
  }
  return sum;
}

function logMatrix(matrix: string[][]) {
  console.log("");
  for (let y = 0; y < matrix.length; y++) {
    console.log(matrix[y].join(""));
  }
}
