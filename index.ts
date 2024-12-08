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
async function runDay(
  day: string
): Promise<{ task1?: number; task2?: number; total: bigint }> {
  const scriptPath = `./years/${year}/day${day}/`;
  const __dirname = join(dirname(__filename), scriptPath);

  let task1 = 0;
  let task2 = 0;
  let totalDuration = BigInt(0);

  console.log(`Starting tasks for day ${day}...`);

  try {
    const module = await import(`${scriptPath}/index.ts`);
    if (typeof module.run === "function") {
      await module.run(__dirname); // cold start

      const start = process.hrtime.bigint();
      [task1 = 0, task2 = 0] = await module.run(__dirname);
      const end = process.hrtime.bigint();
      totalDuration = end - start;
      console.log(`Day ${day} completed in ${formatTime(totalDuration)}`);
    } else {
      console.error(`No run() function found for day ${day}`);
    }
  } catch (error: any) {
    console.error(`Error loading module for day ${day}: ${error.message}`);
  }

  return { task1, task2, total: totalDuration };
}

// Main execution
(async () => {
  console.log(`🎅 ✨ Advent Of Code ${year} ✨`);
  const totalStart = process.hrtime.bigint();
  const results: {
    day: string;
    task1?: number;
    task2?: number;
    total: bigint;
  }[] = [];
  let totalTime = BigInt(0);

  for (const day of days) {
    const result = await runDay(day);
    results.push({ day, ...result });
    totalTime += result.total;
  }

  const totalEnd = process.hrtime.bigint();
  const cellPaddingSmall = 10;
  const cellPadding = 20;
  // Print summary table
  console.log(`\n🎄✨ Advent of Code ${year} Summary ✨🎄`);
  console.log("-".repeat(cellPadding * 4));
  console.log(
    `${"Day".padEnd(cellPaddingSmall)} ${"Task1".padEnd(
      cellPadding
    )} ${"Task2".padEnd(cellPadding)} ${"Total".padEnd(cellPadding)}`
  );
  console.log("-".repeat(cellPadding * 4));

  results.forEach(({ day, task1, task2, total }) => {
    console.log(
      `${day.padEnd(cellPaddingSmall)} ${String(task1 || 0).padEnd(
        cellPadding
      )} ${String(task2 || 0).padEnd(cellPadding)} ${formatTime(total).padEnd(
        cellPadding
      )}`
    );
  });

  console.log("-".repeat(cellPadding * 4));
  console.log(
    `${"Overall".padEnd(cellPaddingSmall)} ${"".padEnd(
      cellPadding
    )} ${"".padEnd(cellPadding)} ${formatTime(totalTime).padEnd(cellPadding)}`
  );
  console.log("=".repeat(cellPadding * 4));
})();
