export function parseArguments(): { year: string; preWarm: boolean; days: string[] } {
    const args = process.argv.slice(2);

    // Default values
    const currentYear = new Date().getFullYear().toString();
    let year = currentYear;
    let preWarm = false;
    let days: string[] = [];

    // Check for help flag
    if (args.includes("--help")) {
        console.log(`
🎄✨ Advent of Code Help ✨🎄

Usage:
  bun run start [options]

Options:
  --day=DAY       Specify a day or range of days between 1 and 25 (e.g., 1, 01, 10, 1-5)
  --year=YYYY     Specify the year (default: current year)
  --pre-warm      Enable pre-warming (default: false)
  --help          Show this help message


🎅 Santa's generator 🎁

Scaffolds a full year of code under the years directory.
Exisiting days will not be overwritten.

years/
|-- day01/
|   |-- index.ts
|   |-- input.txt
|   |-- test.txt

Usage:
  bun run generate [options]

Options:
  --year=YYYY     Specify the year

        `);
        process.exit(0);
    }

    // Parse arguments
    args.forEach((arg) => {
        if (arg.startsWith("--year=")) {
            const yearValue = arg.split("=")[1];
            if (!/^\d{4}$/.test(yearValue)) {
                console.error("Error: Invalid year format. Use --year=YYYY");
                process.exit(1);
            }
            year = yearValue;
        } else if (arg === "--pre-warm") {
            preWarm = true;
        } else if (arg.startsWith("--day=")) {
            const dayArg = arg.split("=")[1];
            // Validate the day argument
            if (!dayArg || !/^(0?[1-9]|1[0-9]|2[0-5]|\d+-\d+)$/.test(dayArg)) {
                console.error(
                    "Error: Please provide a valid day number or range between 1 and 25 (e.g., 1, 01, 10, 1-5)."
                );
                process.exit(1);
            }
            // Parse range or single day
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
        }
    });

    if (days.length === 0) {
        console.error("Error: Missing required argument --day=DAY or --day=START-END.");
        process.exit(1);
    }

    return { year, preWarm, days };
}