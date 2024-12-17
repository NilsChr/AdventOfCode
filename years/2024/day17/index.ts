import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { waitForSpacePress } from "../../../helpers/debug";


const cache = new Map<string, boolean>();

export async function run(dir: string): Promise<[number | string, number | string]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  const registerA = getRegisterValue(input[0])
  const registerB = getRegisterValue(input[1])
  const registerC = getRegisterValue(input[2])
  const program = getProgram(input[4]);

  const cpu = new CPU(registerA, registerB, registerC);
  cpu.runProgram(program)
  /*
    const program = [0, 3, 5, 4, 3, 0]
    const cpu = new CPU(2024, registerB, registerC);
    cpu.runProgram(program)*/

  cpu.printState();
  const task1 = cpu.output.join(",");
  let task2 = 0;


  let aValue = 7930000000; // 7930000000 NEXT BRUTE FORCE
  
  while (true) {
    // if (aValue === cpu.registerA) continue;
    if (aValue % 10000000 === 0) console.log(`A: ${aValue}`)

    //console.log("A:", aValue)

    const cpu2 = new CPU(aValue, registerB, registerC);
    cpu2.lookForProgram = program;
    cpu2.terminateEarly = true;
    cpu2.runProgram(program)

    if (compareArray(cpu2.output, program)) {
      task2 = aValue;
      break;
    }

    aValue++;
  }



  //console.log(task1)

  return [task1, task2]
}

function getRegisterValue(line: string): number {
  const parts = line.split(" ");
  return parseInt(parts[parts.length - 1]);
}

function getProgram(line: string): number[] {
  const parts = line.split(" ");
  return parts[parts.length - 1].split(",").map((n: string) => parseInt(n));
}

class CPU {

  registerA: number = 0;
  registerB: number = 0;
  registerC: number = 0;
  instructionPointer: number = 0;
  output: number[] = [];
  log: boolean = false;
  program: number[] = [];
  lookForProgram: number[] = [];
  terminateEarly: boolean = false;

  constructor(a: number, b: number, c: number) {
    this.registerA = a;
    this.registerB = b;
    this.registerC = c;
  }

  async runProgram(instructions: number[]) {
    this.program = instructions;

    while (this.instructionPointer < instructions.length) {
      //   if(cache.has(this.hash())) return;
      const program = instructions[this.instructionPointer];
      const operand = instructions[this.instructionPointer + 1];
      const code = this.runInstruction(program, operand)

      if (code === 5 && this.terminateEarly) {
        const index = this.output.length - 1;
        if (this.lookForProgram[index] !== this.output[index]) return;
      }

      //if (this.log) {
      //  this.printState()
      //}
      if (code === 1) {
        this.instructionPointer += 2;
      }

      /*if (this.log) {
        await waitForSpacePress(false);
      }*/
    }

    // cache.set(this.hash(), true)
  }

  hash() {
    return `${this.instructionPointer},${this.registerA},${this.registerB},${this.registerC},${this.output.join(",")}`
  }

  printState() {
    let spaces = "";
    for (let i = 0; i < this.instructionPointer; i++) {
      spaces += "  ";
    }
    console.log(`pointer index: ${this.instructionPointer}`)
    console.log(`pointer:${spaces}v`)
    console.log(`program:${this.program} `)

    console.log(`A: ${this.registerA}`)
    console.log(`B: ${this.registerB}`)
    console.log(`C: ${this.registerC}`)
    console.log(`OUT: ${this.output}`)

    console.log("----------------------------------------")
  }

  private runInstruction(code: number, operand: number): number {
    if (this.log) console.log(`run instruction ${code} - ${operand}`)
    switch (code) {
      case 0: return this.adv(operand);
      case 1: return this.bxl(operand);
      case 2: return this.bst(operand);
      case 3: return this.jnz(operand);
      case 4: return this.bxc(operand);
      case 5: return this.out(operand);
      case 6: return this.bdv(operand);
      case 7: return this.cdv(operand);
    }
    return 0
  }

  private literalOperand(operand: number): number {
    switch (operand) {
      case 0: return 0;
      case 1: return 1;
      case 2: return 2;
      case 3: return 3;
      case 4: return this.registerA;
      case 5: return this.registerB;
      case 6: return this.registerC;
    }
    return -1;
  }

  private adv(operand: number): number {
    if (this.log) console.log(`adv: ${operand}`)
    const numerator = this.registerA;
    const denominator = Math.pow(2, this.literalOperand(operand));
    this.registerA = Math.floor(numerator / denominator);
    return 1;
  }

  private bxl(operand: number): number {
    if (this.log) console.log(`bxl: ${operand}`)
    this.registerB = this.registerB ^ operand;
    return 1;
  }

  private bst(operand: number): number {
    if (this.log) console.log(`bst: ${operand}`)
    this.registerB = this.literalOperand(operand) % 8;
    return 1;
  }

  private jnz(operand: number): number {
    if (this.log) console.log(`jnz: ${operand}`)
    if (this.registerA === 0) return 1;
    this.instructionPointer = this.literalOperand(operand);
    return 0;
  }

  private bxc(operand: number): number {
    if (this.log) console.log(`bxc: ${operand}`)
    this.registerB = this.registerB ^ this.registerC;
    return 1;
  }

  private out(operand: number): number {
    if (this.log) console.log(`out: ${operand}`)
    this.output.push(this.literalOperand(operand) % 8);
    return 1;
  }

  private bdv(operand: number): number {
    if (this.log) console.log(`bdv: ${operand}`)
    const numerator = this.registerA;
    const denominator = Math.pow(2, this.literalOperand(operand));
    this.registerB = Math.floor(numerator / denominator);
    return 1;
  }

  private cdv(operand: number): number {
    if (this.log) console.log(`cdv: ${operand}`)
    const numerator = this.registerA;
    const denominator = Math.pow(2, this.literalOperand(operand));
    this.registerC = Math.floor(numerator / denominator);
    return 1;;
  }
}

function compareArray(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function test1() {
  const cpu = new CPU(0, 0, 9);
  cpu.runProgram([2, 6]);
  return cpu.registerB === 1;
}


function test2() {
  const cpu = new CPU(10, 0, 0);
  cpu.runProgram([5, 0, 5, 1, 5, 4]);
  return compareArray(cpu.output, [0, 1, 2])
}

function test3() {
  const cpu = new CPU(2024, 0, 0);
  cpu.runProgram([0, 1, 5, 4, 3, 0]);
  return compareArray(cpu.output, [4, 2, 5, 6, 7, 7, 7, 7, 3, 1, 0]) && cpu.registerA === 0;
}

function test4() {
  const cpu = new CPU(0, 29, 0);
  cpu.runProgram([1, 7]);
  return cpu.registerB === 26;
}

function test5() {
  const cpu = new CPU(0, 2024, 43690);
  cpu.runProgram([4, 0]);
  return cpu.registerB === 44354;
}

function test6() {
  const cpu = new CPU(729, 0, 0);
  cpu.runProgram([0, 1, 5, 4, 3, 0]);
  return compareArray(cpu.output, [4, 6, 3, 5, 6, 3, 5, 2, 1, 0]);
}