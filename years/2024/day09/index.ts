import { join } from "path";
import { parseFileToInt32Array } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToInt32Array(filePath);
  const disk = readDisk(input);

  const disk_task1 = disk.slice();
  defragmentDisk(disk_task1);
  const disk_task2 = disk.slice();
  defragmentDiskFiles(disk_task2)

  const task1 = checkSum(disk_task1);
  const task2 = checkSum(disk_task2);

  return [task1, task2];
}

function readDisk(input: Int32Array): Int32Array {
  let totalSize = 0;
  for (let i = 0; i < input.length; i += 2) {
    totalSize += input[i] + (input[i + 1] || 0);
  }
  const disk = new Int32Array(totalSize);

  let fileId = 0;
  let currentIndex = 0;

  for (let i = 0; i < input.length; i += 2) {
    const file = input[i];
    const free = input[i + 1] || 0;
    for (let j = 0; j < file; j++) {
      disk[currentIndex++] = fileId;
    }
    fileId++;

    for (let j = 0; j < free; j++) {
      disk[currentIndex++] = -1;
    }
  }

  return disk;
}

function defragmentDisk(disk: Int32Array) {
  let startPointer = 0;
  let endPointer = disk.length - 1;

  while (startPointer < endPointer) {
    while (startPointer < endPointer && disk[startPointer] !== -1) {
      startPointer++;
    }

    while (startPointer < endPointer && disk[endPointer] === -1) {
      endPointer--;
    }

    if (startPointer < endPointer) {
      disk[startPointer] = disk[endPointer];
      disk[endPointer] = -1;
    }
  }
}

async function defragmentDiskFiles(disk: Int32Array) {
  let ids = new Set<number>();
  for (let i = 0; i < disk.length; i++) {
    if (disk[i] === -1) continue;
    ids.add(disk[i]);
  }
  const idArray: number[] = Array.from(ids);
  for (let i = idArray.length - 1; i >= 0; i--) {
    const file = findFileById(disk, idArray[i]);
    if (file[0] === -1) continue;
    const block = requestSpace(disk, file[1]);
    if (block === -1) continue;
    if (block > file[0]) continue;

    for (let j = 0; j < file[1]; j++) {
      disk[block + j] = idArray[i];
      disk[file[0] - j] = -1;
    }
  }

}

function findFileById(disk: Int32Array, targetId: number): [number, number] {
  let endPointer = disk.length - 1;
  let fileSize = 0;
  let outPointer = -1;
  while (true) {

    if (disk[endPointer] !== targetId) {
      endPointer--;
      if (endPointer === 0) break;
      continue;
    }

    fileSize = 0;
    while (true) {
      fileSize++;
      if (disk[endPointer - fileSize] !== targetId) break;
    }
    outPointer = endPointer
    break;
  }

  return [outPointer, fileSize];
}

function requestSpace(disk: Int32Array, requestSize: number): number {
  let pointer = 0;
  let blockSize = 0;
  let outPointer = -1;
  while (true) {
    if (pointer >= disk.length - 1) break;
    if (disk[pointer] !== -1) {
      pointer++;
      if (pointer === disk.length - 1) break;
      continue;
    }

    blockSize = 0;
    while (true) {
      blockSize++;
      if (disk[pointer + blockSize] !== -1) break;
    }
    if (blockSize < requestSize) {
      pointer += blockSize;
      continue
    }
    outPointer = pointer;
    break;
  }

  return outPointer;
}

function checkSum(disk: Int32Array): number {
  let output = 0;
  for (let i = 0; i < disk.length; i++) {
    if (disk[i] === -1) continue;
    output += i * disk[i];
  }
  return output;
}

function debugDisk(disk: Int32Array, showPointers: boolean = false, start: number = 0, end: number = 0) {

  if (showPointers) {
    let pointers = "";
    for (let i = 0; i < disk.length; i++) {
      if (i === start || i === end) pointers += "v";
      else pointers += " ";
    }
    console.log(pointers);
  }


  const text = Array.from(disk)
    .map((d) => {
      if (d === -1) return ".";
      else return d;
    })
    .join("");

  console.log(text);
}