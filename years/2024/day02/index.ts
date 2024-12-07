import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  const reports = lines.map((line) => line.split(" ").map(Number));
  const safeReports = reports.filter(isSafe);
  const unsafeReports = reports.filter((report) => !isSafe(report));

  const task1 = safeReports.length;
  const task2 = task1 + rerunWithSkip(unsafeReports);

  return [task1, task2];
}

function isSafe(numbers: number[]): boolean {
  const consistentDir = numbers.every(
    (_, i) =>
      i === 0 ||
      Math.sign(numbers[i] - numbers[i - 1]) ===
        Math.sign(numbers[1] - numbers[0])
  );

  const validDifferences = numbers.every(
    (_, i) =>
      i === 0 ||
      (Math.abs(numbers[i] - numbers[i - 1]) >= 1 &&
        Math.abs(numbers[i] - numbers[i - 1]) <= 3)
  );

  return consistentDir && validDifferences;
}

function rerunWithSkip(reports: number[][]): number {
  let fixedCount = 0;
  for (const report of reports) {
    for (let i = 0; i < report.length; i++) {
      const reducedReport = report.filter((_, idx) => idx !== i);
      if (isSafe(reducedReport)) {
        fixedCount++;
        break;
      }
    }
  }
  return fixedCount;
}
