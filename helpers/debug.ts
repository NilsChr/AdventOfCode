import Vec2 from "./vec2";
import readline from "readline";

export function debugGrid(
  grid: string[][],
  focusPoint: Vec2,
  focusChar: string = "o",
  clear = true
) {
  if (clear) console.clear();
  for (let y = 0; y < grid.length; y++) {
    let row = "";
    for (let x = 0; x < grid[y].length; x++) {
      if (focusPoint.x === x && focusPoint.y === y) {
        row += focusChar;
      } else {
        row += grid[y][x];
      }
    }
    console.log(row);
  }
}

export async function waitForSpacePress(): Promise<void> {
  return new Promise((resolve) => {
    console.log('\npress space to progress debug')

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Ensure raw mode is enabled for capturing single key presses
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const handleKeyPress = (chunk: Buffer) => {
      if (chunk.toString() === " ") {
        // Spacebar is represented as " "
        process.stdin.removeListener("data", handleKeyPress);
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        rl.close();
        resolve();
      }
    };

    process.stdin.on("data", handleKeyPress);
  });
}

/*

function printMap(grid: string[][], guard: Guard) {
  console.clear();
  for (let y = 0; y < grid.length; y++) {
    let row = "";
    for (let x = 0; x < grid[y].length; x++) {
      if (guard.pos.x === x && guard.pos.y === y) {
        row += guard.icon();
      } else {
        row += grid[y][x];
      }
    }
    console.log(row);
  }
}

*/
