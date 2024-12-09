import { join } from "path";
import { parseFileToInt32Array } from "../../../helpers/fileParser";
import { waitForSpacePress } from "../../../helpers/debug";

const TYPE = {
  FILE: 0,
  SPACE: 1
};

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToInt32Array(filePath);
  const disk = readDisk(input);
  const disk_task1 = disk.slice();

  defragmentDisk(disk_task1);
  const disk_task2 = disk.slice();
  debugDisk(disk_task2);
  await defragmentDiskFiles(disk_task2);

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
  let startPointer = 0;
  let endPointer = disk.length - 1;

  while (startPointer < endPointer) {
    while (startPointer < endPointer && disk[startPointer] !== -1) {
      startPointer++;
    }
    let diskSpace = 0;
    while (disk[startPointer + diskSpace] === -1) {
      diskSpace++;
    }
    console.log("FIRST AVAILABLE SIZE: ", diskSpace);

    while (startPointer < endPointer && disk[endPointer] === -1) {
      endPointer--;
    }

    let fileId = disk[endPointer];
    let fileSize = Infinity; //getFileSize(disk, fileId, endPointer);
    let scanPointer = endPointer;
    while (fileSize >= diskSpace) {
      console.log(`Filesize: ${fileSize}, Diskspace: ${diskSpace}, Space: ${!(fileSize >= diskSpace)}`)
      fileSize = getFileSize(disk, fileId, scanPointer);
      console.log("SCAN filesize", fileId, fileSize);
      scanPointer -= fileSize;
      /*while(disk[scanPointer] === -1) {
        scanPointer--;
      }
      fileId = disk[scanPointer];*/
      let t = "";
      for (let i = 0; i < disk.length; i++) {
        if (i === startPointer || i === scanPointer) t += "v";
        else t += " ";
      }
      console.log(t);
      debugDisk(disk);
      await waitForSpacePress();
    }

    console.log("MOVING FILE: ", fileId, fileSize);

    let t = "";
    for (let i = 0; i < disk.length; i++) {
      if (i === startPointer || i === endPointer) t += "v";
      else t += " ";
    }
    console.log(t);
    debugDisk(disk);
    for (let i = 0; i < fileSize; i++) {
      disk[startPointer + i] = fileId;
      disk[endPointer - i] = -1;
    }
    startPointer += fileSize;
    endPointer -= fileSize;
    t = "";
    for (let i = 0; i < disk.length; i++) {
      if (i === startPointer || i === endPointer) t += "v";
      else t += " ";
    }
    console.log(t);
    debugDisk(disk);

    /*
    if (startPointer < endPointer) {
      disk[startPointer] = disk[endPointer];
      disk[endPointer] = -1;
    }
      */
  }
}

function getFileSize(disk: Int32Array, fileId: number, from: number): number {
  let pointer = from;
  let size = 0;
  while (disk[pointer] === fileId) {
    size++;
    pointer--;
  }
  return size;
}

function checkSum(disk: Int32Array): number {
  let output = 0;
  for (let i = 0; i < disk.length; i++) {
    if (disk[i] === -1) break;
    output += i * disk[i];
  }
  return output;
}

function debugDisk(disk: Int32Array) {
  const text = Array.from(disk)
    .map((d) => {
      if (d === -1) return ".";
      else return d;
    })
    .join("");

  console.log(text);
}

/*
15:00
16:00 - Buss til Asker
17:00 - Flytog
18:00 - OK
19:00

file: [type, id, start, size]
free: [type, start, size]

disk:[
  [FILE, id, start, size],
  [SPACE, start, size]
]
*/
