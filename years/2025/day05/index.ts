import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  let ranges: Range[] = [];
  let ids: number[] = [];

  let parseIds = false;
  for (let line of input) {
    if (line === "") {
      parseIds = true;
      continue;
    }
    if (!parseIds) {
      const numbers = line.split("-").map(Number);
      ranges.push({ min: numbers[0], max: numbers[1] });
    } else {
      ids.push(parseInt(line));
    }
  }

  let task1 = 0;
  for (let id of ids) {
    for (let range of ranges) {
      if (isWithinRange(id, range)) {
        task1++;
        break;
      } else {
      }
    }
  }

  let merged = joinRanges(ranges);
  let task2 = 0;
  for (let range of merged) {
    task2 += range.max - range.min + 1;
  }

  return [task1, task2];
}

interface Range {
  min: number;
  max: number;
}

function isWithinRange(id: number, range: Range): boolean {
  return id >= range.min && id <= range.max;
}

function joinRanges(ranges: Range[]): Range[] {
  
  ranges.sort((a, b) => a.min - b.min);
  const merged: Range[] = [ranges[0]];

  for(let i = 1; i < ranges.length; i++) {
    const range = ranges[i];
    const mergedRange = merged[merged.length-1]

    if(range.min <= mergedRange.max) {
      mergedRange.max = Math.max(mergedRange.max, range.max)
    } else {
      merged.push(range)
    }
  }


  return merged;
}