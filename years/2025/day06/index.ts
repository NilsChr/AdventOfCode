import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  let operators = input[input.length - 1].split("");

  let pointer = 0;
  let matrixes: string[][][] = [];
  while (pointer < operators.length) {
    let operator = operators[pointer];
    let operatorIndex = pointer;
    let length = 0;
    if (operator !== " ") {
      while (operators[pointer + 1] === " ") {
        length++;
        pointer++;
      }
    } else continue;
    if (pointer >= operators.length - 1) {
      length = operators.length - operatorIndex + 1;
    }

    let matrix: string[][] = [];
    for (let y = 0; y < input.length - 1; y++) {
      let chunk = input[y].substring(operatorIndex, operatorIndex + length);
      matrix.push(chunk.split(""));
    }
    matrixes.push(matrix);
    pointer++;
  }

  let t1 = 0;
  let t2 = 0;
  const operatorSigns = operators.filter((o) => o !== " ");
  for (let i = 0; i < operatorSigns.length; i++) {
    const operator = operatorSigns[i];
    const matrix = matrixes[i];

    t1 += sumMatrix(matrix, operator);
    let m2 = rotateMatrix(matrix);
    t2 += sumMatrix(m2, operator);
  }
  const task1 = t1;
  const task2 = t2;

  return [task1, task2];
}

function rotateMatrix(matrix: string[][]): string[][] {
  let matrixOut = [];
  let columns = matrix[0].length;
  for(let col = columns-1; col >= 0; col--) {
    let row = []
    for(let y = 0; y < matrix.length; y++) {
      row.push(matrix[y][col])
    }
    matrixOut.push(row)
  }
  return matrixOut;

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

function logMatrix(matrix: string[][]) {
  console.log("");
  for (let y = 0; y < matrix.length; y++) {
    console.log(matrix[y].join(""));
  }
}
