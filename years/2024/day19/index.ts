import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

let highestLevel = 0;

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  const patterns = input[0].split(',').map(s => s.trim()).sort((a, b) => b.length - a.length);
  const carpets = input.slice(2);
  //console.log(patterns);
  //console.log(carpets);

  /*
  for(let i = 2; i < input.length; i++) {
    console.log(input[i]);
  }
    */
  let score = 0;

  for (let carpet of carpets) {
    console.log();
    console.log('CHECK')
    highestLevel = 0;
    let carpetScore = checkDesign(carpet, patterns);
    console.log(carpet)
    console.log(carpetScore);
    //console.log(`${carpet} score is ${carpetScore}`)
    score += carpetScore === carpet ? 1 : 0;
  }

  //console.log('carpest', carpets.length)

  //checkDesign(carpets[0], patterns);


  const task1 = score;
  const task2 = 0;

  return [task1, task2]
}

type CheckData = { validList: string[], complete: boolean }

function checkDesign(carpet: string, patterns: string[]): string {
  //console.log();
  //console.log('0', carpet);
  const checkData: CheckData = { validList: [], complete: false }
  for (let pattern of patterns) {
    matchPattern(carpet, pattern, patterns, checkData, [], 0);
  }
  //console.log(checkData.validList);
  //console.log('1',checkData.validList.join(""))
  console.log(checkData.validList);
  return checkData.validList.join("");//checkData.validList.length > 0 ? 1 : 0;
}

function matchPattern__(carpet: string, pattern: string, patterns: string[], checkData: CheckData, tempList: string[], level: number) {
  if (checkData.complete) return;

  if (carpet === "") {
    checkData.validList.push(...tempList)
    checkData.complete = true;
    return;
  }

  if (carpet.length === 1) {
    if (patterns.includes(carpet)) {
      const temp = [...tempList, carpet];
      matchPattern("", carpet, patterns, checkData, temp, level + 1);

    } else {
      checkData.complete = true;
      return
    }
  } else {

    const len = pattern.length;
    if (carpet.substring(0, len) === pattern) {
      const temp = [...tempList, pattern];
      for (let pattern of patterns) {
        matchPattern(carpet.slice(len), pattern, patterns, checkData, temp, level + 1);
      }
    }
  }
}

function matchPattern(
  carpet: string,
  pattern: string,
  patterns: string[],
  checkData: CheckData,
  tempList: string[],
  level: number
) {
  if (checkData.complete) return; // Exit if already complete

  // Base case: when the carpet is empty
  if (carpet === "") {
    checkData.validList.push(...tempList);
    checkData.complete = true;
    return;
  }

  // Avoid infinite loop: if the carpet length is the same as the last level
  if (level > 0 && tempList.length > 0 && carpet === tempList[tempList.length - 1]) {
    return; // Prevents reprocessing the same carpet substring
  }

  // Check for a single-character match
  if (carpet.length === 1) {
    if (patterns.includes(carpet)) {
      checkData.validList.push(...tempList, carpet);
      checkData.complete = true;
    }
    return; // Exit after single-character check
  }

  // General case: match the pattern
  console.log('CARPET', carpet);
  if (carpet.startsWith(pattern)) {
    const updatedTempList = [...tempList, pattern];
    const remainingCarpet = carpet.slice(pattern.length);

  

    console.log('CHECK CARPETS', remainingCarpet);
    for (const nextPattern of patterns) {
      if (remainingCarpet.startsWith(nextPattern)) {

        matchPattern(remainingCarpet, nextPattern, patterns, checkData, updatedTempList, level + 1);
        //if (checkData.complete) return; // Stop further recursion if completed
      }
    }

    // Exit if no progress was made
  }
}
