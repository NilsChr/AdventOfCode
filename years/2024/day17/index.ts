import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(
  dir: string
): Promise<[bigint | string, bigint | string]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToRows(filePath);

  const a = getRegisterValue(input[0]);
  const b = getRegisterValue(input[1]);
  const c = getRegisterValue(input[2]);
  const program = getProgram(input[4]);

  const cpu = new CPU(a, b, c);
  cpu.runProgram(program);

  const task1 = cpu.output.join(",");
  let task2 = BigInt(0);

  let seed = BigInt(0);
  for (let i = 1; i <= program.length; i++) {
    seed <<= BigInt(3);
    while (true) {
      const cpu2 = new CPU(seed, BigInt(0), BigInt(0));
      cpu2.runProgram(program);
      if (compareArray(cpu2.output, program.slice(-i))) {
        task2 = seed;
        break;
      }
      seed++;
    }
  }

  return [task1, task2];
}

function getRegisterValue(line: string): bigint {
  const parts = line.split(" ");
  return BigInt(parts[parts.length - 1]);
}

function getProgram(line: string): bigint[] {
  const parts = line.split(" ");
  return parts[parts.length - 1].split(",").map((n: string) => BigInt(n));
}

class CPU {
  registerA: bigint = BigInt(0);
  registerB: bigint = BigInt(0);
  registerC: bigint = BigInt(0);
  instructionPointer: bigint = BigInt(0);
  output: bigint[] = [];
  log: boolean = false;
  program: bigint[] = [];
  lookForProgram: bigint[] = [];
  terminateEarly: boolean = false;

  constructor(a: bigint, b: bigint, c: bigint) {
    this.registerA = a;
    this.registerB = b;
    this.registerC = c;
  }

  async runProgram(instructions: bigint[]) {
    this.program = instructions;

    while (this.instructionPointer < instructions.length) {
      const program = instructions[Number(this.instructionPointer)];
      const operand = instructions[Number(this.instructionPointer + BigInt(1))];
      const code = this.runInstruction(program, operand);

      if (code === BigInt(5) && this.terminateEarly) {
        const index = this.output.length - 1;
        if (this.lookForProgram[index] !== this.output[index]) return;
      }
      if (code === BigInt(1)) {
        this.instructionPointer += BigInt(2);
      }
    }
  }

  private runInstruction(code: bigint, operand: bigint): bigint {
    if (this.log) console.log(`run instruction ${code} - ${operand}`);
    switch (code) {
      case BigInt(0):
        return this.adv(operand);
      case BigInt(1):
        return this.bxl(operand);
      case BigInt(2):
        return this.bst(operand);
      case BigInt(3):
        return this.jnz(operand);
      case BigInt(4):
        return this.bxc(operand);
      case BigInt(5):
        return this.out(operand);
      case BigInt(6):
        return this.bdv(operand);
      case BigInt(7):
        return this.cdv(operand);
    }
    return BigInt(0);
  }

  private literalOperand(operand: bigint): bigint {
    switch (operand) {
      case BigInt(0):
        return BigInt(0);
      case BigInt(1):
        return BigInt(1);
      case BigInt(2):
        return BigInt(2);
      case BigInt(3):
        return BigInt(3);
      case BigInt(4):
        return this.registerA;
      case BigInt(5):
        return this.registerB;
      case BigInt(6):
        return this.registerC;
    }
    return BigInt(-1);
  }

  private adv(operand: bigint): bigint {
    const numerator = this.registerA;
    const denominator = BigInt(2) ** this.literalOperand(operand);
    this.registerA = numerator / denominator;
    return BigInt(1);
  }

  private bxl(operand: bigint): bigint {
    this.registerB = this.registerB ^ operand;
    return BigInt(1);
  }

  private bst(operand: bigint): bigint {
    this.registerB = this.literalOperand(operand) % BigInt(8);
    return BigInt(1);
  }

  private jnz(operand: bigint): bigint {
    if (this.registerA === BigInt(0)) return BigInt(1);
    this.instructionPointer = this.literalOperand(operand);
    return BigInt(0);
  }

  private bxc(operand: bigint): bigint {
    this.registerB = this.registerB ^ this.registerC;
    return BigInt(1);
  }

  private out(operand: bigint): bigint {
    this.output.push(this.literalOperand(operand) % BigInt(8));
    return BigInt(1);
  }

  private bdv(operand: bigint): bigint {
    const numerator = this.registerA;
    const denominator = BigInt(2) ** this.literalOperand(operand);
    this.registerB = numerator / denominator;
    return BigInt(1);
  }

  private cdv(operand: bigint): bigint {
    const numerator = this.registerA;
    const denominator = BigInt(2) ** this.literalOperand(operand);
    this.registerC = numerator / denominator;
    return BigInt(1);
  }

  printState() {
    let spaces = "";
    for (let i = 0; i < this.instructionPointer; i++) {
      spaces += "  ";
    }
    console.log(`pointer index: ${this.instructionPointer}`);
    console.log(`pointer:${spaces}v`);
    console.log(`program:${this.program} `);

    console.log(`A: ${this.registerA}`);
    console.log(`B: ${this.registerB}`);
    console.log(`C: ${this.registerC}`);
    console.log(`OUT: ${this.output}`);

    console.log("----------------------------------------");
  }
}

function compareArray(a: bigint[], b: bigint[]): boolean {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}
