import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  let table: string[][] = [];
  for (let i = 0; i < input.length - 1; i++) {
    const numbers = input[i].split(/\s+/).filter((n) => n !== "");
    table.push(numbers);
  }
  let operators = input[input.length - 1].split(/\s+/);
  let t = 0;
  for (let i = 0; i < operators.length - 1; i++) {
    let operator = operators[i];
    let sum = parseInt(table[0][i]);
    for (let j = 1; j < table.length; j++) {
      switch (operator) {
        case "*":
          sum *= parseInt(table[j][i]);
          break;
        case "+":
          sum += parseInt(table[j][i]);
          break;
      }
    }
    t += sum;
  }
  const longest = findLongestString(table);
  padTable(table, longest);
  console.log(table);
  let t2 = 0;
  for (let col = operators.length - 2; col > 0; col--) {
    console.log(col);
    let operator = operators[col];
    let matrix: string[][] = [];
    for (let y = 0; y < table.length; y++) {
      const chunk = table[y][col];
      matrix.push(chunk.split(""));
    }
    //logMatrix(matrix)
    rotateMatrix(matrix);

    let sum =  parseInt(matrix[0].join(""));
          console.log('adding: ', sum)

    for (let y = 1; y < matrix.length; y++) {
      let n = parseInt(matrix[y].join(""));
      console.log('adding: ', n)
      switch (operator) {
        case "*":
          sum *= n;//parseInt(matrix[y].join(""));
          break;
        case "+":
          sum += n;//parseInt(matrix[y].join(""));
          break;
      }
    }
    console.log('Added: ', sum)
    t2 += sum;
    //logMatrix(matrix)

    //break;
  }

  const task1 = t;
  const task2 = t2;

  return [task1, task2];
}

function findLongestString(table: string[][]): number {
  let longest = 0;

  for (let y = 0; y < table.length; y++) {
    for (let x = 0; x < table[y].length; x++) {
      longest = Math.max(table[y][x].length, longest);
    }
  }

  return longest;
}

function padTable(table: string[][], padSize: number) {
  for (let y = 0; y < table.length; y++) {
    for (let x = 0; x < table[y].length; x++) {
      if (table[y][x].length < padSize) {
        for (let p = 0; p < padSize - table[y][x].length; p++) {
          table[y][x] += " ";
        }
      }
    }
  }
}

function rotateMatrix(matrix: string[][]) {
  const n = matrix.length;

  const res = Array.from({ length: n }, () => Array(n).fill(0));

  // Rotate the matrix 90 degrees counterclockwise
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      res[n - j - 1][i] = matrix[i][j];
    }
  }

  // Copy the result matrix back to original matrix
  for (let i = 0; i < n; i++) {
    matrix[i] = res[i].slice();
  }
}

function logMatrix(matrix: string[][]) {
  for (let y = 0; y < matrix.length; y++) {
    console.log(matrix[y].join(""));
  }
}
