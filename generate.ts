import { promises as fs } from "fs";
import { join } from "path";

/**
 * Copies a folder from source to destination if the destination folder does not exist.
 * @param source - The path to the source folder.
 * @param destination - The path to the destination folder.
 */
async function copyFolderIfNotExists(
  source: string,
  destination: string
): Promise<void> {
  try {
    const destinationExists = await fs
      .access(destination)
      .then(() => true)
      .catch(() => false);

    if (destinationExists) {
      console.log(`Destination folder already exists: ${destination}`);
      return;
    }

    await fs.mkdir(destination, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = join(source, entry.name);
      const destPath = join(destination, entry.name);

      if (entry.isDirectory()) {
        await copyFolderIfNotExists(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }

    console.log(`Folder copied from ${source} to ${destination}`);
  } catch (error: any) {
    console.error(`Error copying folder: ${error.message}`);
  }
}

/**
 * Removes the first line from a file if it matches `//@ts-nocheck`.
 * @param filePath - The path to the file.
 */
async function removeSpecificFirstLine(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");

    if (lines[0].trim() === "//@ts-nocheck") {
      const updatedContent = lines.slice(1).join("\n");
      await fs.writeFile(filePath, updatedContent, "utf-8");
      console.log(`Removed //@ts-nocheck from ${filePath}`);
    } else {
      console.log(`No //@ts-nocheck found in ${filePath}`);
    }
  } catch (error: any) {
    console.error(`Error modifying file: ${error.message}`);
  }
}

/**
 * Generates day folders (day1 to day25) for the given year.
 * @param year - The year for which folders should be generated.
 */
async function generateDayFolders(year: string): Promise<void> {
  const sourceFolder = "./template";
  const baseDestinationFolder = `./years/${year}`;

  for (let day = 1; day <= 25; day++) {
    const dayFolderName = `day${day}`;
    const destinationFolder = join(baseDestinationFolder, dayFolderName);
    const destinationFile = join(destinationFolder, "index.ts");

    console.log(`Creating folder: ${destinationFolder}`);
    await copyFolderIfNotExists(sourceFolder, destinationFolder);
    await removeSpecificFirstLine(destinationFile);
  }
}

/**
 * Parses CLI arguments to extract the `year` argument.
 * @returns The extracted year.
 */
function parseArguments(): string {
  const args = process.argv.slice(2);
  const yearArg = args.find((arg) => arg.startsWith("--year="));

  if (!yearArg) {
    console.error("Error: Missing required argument --year=YYYY");
    process.exit(1);
  }

  const year = yearArg.split("=")[1];

  if (!/^\d{4}$/.test(year)) {
    console.error("Error: Invalid year format. Use --year=YYYY");
    process.exit(1);
  }

  return year;
}

// Main script execution
const year = parseArguments();
generateDayFolders(year).catch((err) =>
  console.error("Unhandled error:", err)
);
