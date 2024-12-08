import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  const rulesMap = new Map<number, Set<number>>();
  const pages: number[][] = [];

  let parse_step = 0;
  for (let line of lines) {
    if (line === "") {
      parse_step++;
      continue;
    }
    if (parse_step === 0) {
      const [from, to] = line
        .trim()
        .split("|")
        .map((s) => parseInt(s));
      if (!rulesMap.has(from)) {
        rulesMap.set(from, new Set());
      }
      rulesMap.get(from)!.add(to);
    } else {
      pages.push(
        line
          .trim()
          .split(",")
          .map((s) => parseInt(s))
      );
    }
  }

  let task1 = 0;
  let task2 = 0;

  for (let page of pages) {
    if (isValidPage(rulesMap, page)) {
      task1 += page[Math.floor(page.length / 2)];
    } else {
      reorderPage(rulesMap, page);
      task2 += page[Math.floor(page.length / 2)];
    }
  }

  return [task1, task2];
}

function isValidPage(
  rulesMap: Map<number, Set<number>>,
  page: number[]
): boolean {
  const pageSet = new Set(page);

  for (let i = 0; i < page.length; i++) {
    const digit = page[i];
    const targets = rulesMap.get(digit) || new Set();

    for (const target of targets) {
      if (pageSet.has(target)) {
        const index = page.indexOf(target);
        if (index !== -1 && index < i) {
          return false;
        }
      }
    }
  }

  return true;
}

function reorderPage(rulesMap: Map<number, Set<number>>, page: number[]): void {
  let swapped: boolean;

  do {
    swapped = false;

    for (let i = 0; i < page.length; i++) {
      const digit = page[i];
      const targets = rulesMap.get(digit) || new Set();

      for (const target of targets) {
        const index = page.indexOf(target);
        if (index !== -1 && index < i) {
          [page[i], page[index]] = [page[index], page[i]];
          swapped = true;
          break;
        }
      }

      if (swapped) break;
    }
  } while (swapped);
}
