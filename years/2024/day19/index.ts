import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  const patterns = input[0]
    .split(",")
    .map((s) => s.trim())
    .sort((a, b) => b.length - a.length);
  const carpets = input.slice(2);

  let task1 = 0;
  let task2 = 0;

  let processed = 0
  for (let carpet of carpets) {
    const [a, b] = checkDesign(carpet, patterns);
    console.log(`${processed++}/${carpets.length}`)
    task1 += a;
    task2 += b;
  }

  return [task1, task2];
}
function checkDesign__(
  carpet: string,
  patterns: string[],
  memo: Record<string, boolean> = {}
): boolean {
  if (carpet in memo) return memo[carpet];
  if (carpet === "") return true;

  for (let pattern of patterns) {
    if (pattern === "") continue;
    if (carpet.startsWith(pattern)) {
      const remaining = carpet.slice(pattern.length);
      if (checkDesign__(remaining, patterns, memo)) {
        memo[carpet] = true;
        return true;
      }
    }
  }
  memo[carpet] = false;
  return false;
}

type CheckData = { validList: Set<string>; complete: boolean; limit: number };

function checkDesign(carpet: string, patterns: string[]): [number, number] {
  //console.log(`Check design ${carpet}`);
  const checkData: CheckData = {
    validList: new Set(),
    complete: false,
    limit: 0
  };
  const validPatterns = patterns.filter(p => carpet.includes(p))

  for (let pattern of patterns) {
    matchPattern(carpet, pattern, validPatterns, checkData, [], 0);
  }
  //console.log(checkData.validList.size);
  return [checkData.validList.size > 0 ? 1 : 0, checkData.validList.size];
}

async function matchPattern(
  carpet: string,
  pattern: string,
  patterns: string[],
  checkData: CheckData,
  tempList: string[],
  level: number
  //memo: Set<string>
) {
  if (checkData.limit++ > 100000000) return;

  // Log the attempt to process the current substring
  // console.log(`Processing: carpet="${carpet}", pattern="${pattern}"`);

  // Add the current substring to the memoization set
  //memo.add(key);

  if (carpet === "") {
    checkData.validList.add(tempList.join(","));
    return;
  }

  if (carpet.length === 1) {
    if (patterns.includes(carpet)) {
      const temp = [...tempList, carpet];
      tempList = [...tempList, carpet];
      checkData.validList.add([...temp].join(","));
    }
    return;
  }

  const len = pattern.length;
  if (carpet.substring(0, len) === pattern) {
    const temp = [...tempList, pattern];
    for (let pattern of patterns) {
      matchPattern(
        carpet.slice(len),
        pattern,
        patterns,
        checkData,
        temp,
        level + 1
        // memo
      );
    }
  }
}

//76983 too low
//391903
//2501451