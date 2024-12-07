import { formatTime } from "./helpers/time";
import { dirname, join } from "path";

const year = 2024; // Set the year for Advent of Code

const args = process.argv.slice(2);
const dayArg = args[0];

// Validate the day argument
if (!dayArg || !/^(0?[1-9]|1[0-9]|2[0-5]|\d+-\d+)$/.test(dayArg)) {
  console.error(
    "Error: Please provide a valid day number or range between 1 and 25 (e.g., 1, 01, 10, 1-5)."
  );
  process.exit(1);
}

// Parse range or single day
let days: string[] = [];
if (dayArg.includes("-")) {
  const [start, end] = dayArg.split("-").map((num) => Number(num));
  if (start < 1 || end > 25 || start > end) {
    console.error(
      "Error: Invalid range. Ensure the range is between 1 and 25 and start <= end."
    );
    process.exit(1);
  }
  days = Array.from({ length: end - start + 1 }, (_, i) =>
    String(start + i).padStart(2, "0")
  );
} else {
  days = [String(Number(dayArg)).padStart(2, "0")];
}

// Function to run a single day
async function runDay(day: string): Promise<bigint> {
  const scriptPath = `./years/${year}/day${day}/`;
  const __dirname = join(dirname(__filename), scriptPath);

  try {
    const module = await import(`${scriptPath}/index.ts`);
    if (typeof module.run === "function") {
      console.log(`🎅 ✨AdventOfCode✨`);
      console.log(`${year}-day-${day}`);
      const start = process.hrtime.bigint();
      await module.run(__dirname);
      const end = process.hrtime.bigint();
      const durationNs = end - start;
      console.log(`Duration for day ${day}: ${formatTime(durationNs)}`);
      return durationNs;
    } else {
      console.error(`No run() function found in ${scriptPath}`);
      return BigInt(0);
    }
  } catch (error: any) {
    console.error(`Error loading module for day ${day}:`, error.message);
    return BigInt(0);
  }
}

// Main execution
(async () => {
  const totalStart = process.hrtime.bigint();
  let totalTime = BigInt(0);

  for (const day of days) {
    totalTime += await runDay(day);
  }

  const totalEnd = process.hrtime.bigint();
  const grandTotal = totalEnd - totalStart;

  if (days.length > 1) {
    console.log("\n🎄✨ Advent of Code Summary ✨🎄");
    console.log(`Days ${dayArg} total time: ${formatTime(totalTime)}`);
    console.log(`Including overhead (module loading, etc.): ${formatTime(grandTotal)}`);
  }
})();
