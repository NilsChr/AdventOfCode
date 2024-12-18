import { Vec2 } from "./vec2";
import readline from "readline";

export function debugGrid(
  grid: string[][] | number[][],
  debugPoints: { pos: Vec2; char: string }[],
  clear = true
) {
  if (clear) console.clear();
  for (let y = 0; y < grid.length; y++) {
    let row = "";
    for (let x = 0; x < grid[y].length; x++) {
      const debugPoint = debugPoints.find(
        (p) => p.pos.x === x && p.pos.y === y
      );
      if (debugPoint) {
        row += debugPoint.char;
      } else {
        const cell: string | number = grid[y][x];
        row += cell;
      }
    }
    console.log(row);
  }
}

export async function waitForSpacePress(
  showPrompt: boolean = true,
  clearScreen: boolean = false
): Promise<void> {
  return new Promise((resolve) => {
    if (showPrompt) {
      console.log("\npress space to progress debug");
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const handleKeyPress = (chunk: Buffer) => {
      if (chunk.toString() === " ") {
        console.log("");
        process.stdin.removeListener("data", handleKeyPress);
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        rl.close();
        if (clearScreen) {
          console.clear();
        }
        resolve();
      }
    };

    process.stdin.on("data", handleKeyPress);
  });
}
