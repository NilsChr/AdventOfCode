import { formatTime } from "./helpers/time";
import { dirname, join } from "path";

const year = 2024; // Set the year for Advent of Code

const args = process.argv.slice(2);
const dayArg = args[0];

if (!dayArg || isNaN(Number(dayArg)) || Number(dayArg) < 1 || Number(dayArg) > 25) {
  console.error("Error: Please provide a valid day number between 1 and 25.");
  process.exit(1);
}

const day = Number(dayArg);

const scriptPath = `./years/${year}/day${day}/`;
const __dirname = join(dirname(__filename), scriptPath);

// Dynamically import the module for the given day
try {
  const module = await import(`${scriptPath}/index.ts`);

  if (typeof module.run === "function") {
    console.log(`🎅 ✨AdventOfCode✨`);
    console.log(`${year}-day${day}`);
    const start = process.hrtime.bigint();
    await module.run(__dirname);
    const end = process.hrtime.bigint();
    const durationNs = end - start;
    console.log(`Duration ${formatTime(durationNs)}`);
  } else {
    console.error(`No run() function found in ${scriptPath}`);
  }
} catch (error:any) {
  console.error(`Error loading module for day ${day}:`, error.message);
}
