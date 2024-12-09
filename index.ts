import { parseArguments } from "./cli/args";
import { formatTime } from "./helpers/time";
import { dirname, join } from "path";

const { days, year, preWarm } = parseArguments();

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
      if (preWarm) {
        await module.run(__dirname);
      }

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
