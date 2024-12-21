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

export enum KEY_CODE {
  ARROW_UP = '\u001b[A',
  ARROW_DOWN = '\u001b[B',
  ARROW_RIGHT = '\u001b[C',
  ARROW_LEFT = '\u001b[D',
  ENTER = '\r',
  ESCAPE = '\u001b',
  SPACE = ' ', // Space key
}

export function awaitKeyPress(keys: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let buffer = ''; // To handle multi-character sequences

    const onData = (chunk: string) => {
      if (chunk === '\u0003') { // Handle Ctrl+C (Exit immediately)
        console.log('\nExiting...');
        process.exit();
      }

      buffer += chunk;

      // Check if the buffer matches any of the expected keys
      if (keys.includes(buffer)) {
        process.stdin.removeListener('data', onData); // Stop listening
        process.stdin.setRawMode(false); // Reset raw mode
        process.stdin.pause(); // Stop stdin
        resolve(buffer); // Resolve with the matching key
      }

      // Reset the buffer if no matching key is found
      if (!keys.some((key) => key.startsWith(buffer))) {
        buffer = '';
      }
    };

    process.stdin.on('data', onData);
  });
}