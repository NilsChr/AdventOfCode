export async function parseFileToString(filePath: string): Promise<string> {
  return await Bun.file(filePath).text();
}

export async function parseFileToRows(filePath: string): Promise<string[]> {
  const data = await Bun.file(filePath).text();
  return data.split(/\r?\n/);
}

export async function parseFileRowsToInts(filePath: string): Promise<number[]> {
  const data = await Bun.file(filePath).text();
  const rows = data.split(/\r?\n/);

  const numbers: number[] = [];
  for (const line of rows) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    const num = parseInt(trimmed, 10);
    if (Number.isNaN(num)) {
      throw new Error(`Failed to parse a line as i32: "${line}"`);
    }
    numbers.push(num);
  }

  return numbers;
}

export async function parseFileToInt32Array(filePath: string): Promise<Int32Array> {
  const data = await Bun.file(filePath).text();
  const array = Int32Array.from(data, (char) => {
    const charCode = char.charCodeAt(0);
    return charCode >= 48 && charCode <= 57 ? charCode - 48 : 0;
  });

  return array;
}

export async function parseFileToGrid(filePath: string): Promise<string[][]> {
  const data = await Bun.file(filePath).text();
  const rows = data.split(/\r?\n/);
  return rows.map((line) => line.split(""));
}

export async function parseFileToGridOfType<T>(filePath: string, converter: (char: string) => T): Promise<T[][]> {
  const data = await Bun.file(filePath).text();
  const rows = data.split(/\r?\n/);
  return rows.map((line) => line.split("").map(converter));
}

export async function parseFileToGridUint8(
  filePath: string
): Promise<Uint8Array[][]> {
  const data = await Bun.file(filePath).text();
  const rows = data.split(/\r?\n/);
  return rows.map((line) =>
    line.split("").map((char) => new Uint8Array([char.charCodeAt(0)]))
  );
}

export async function parseFileToGridFlat(
  filePath: string,
  _rowSize: number
): Promise<string[]> {
  const data = await Bun.file(filePath).text();
  const rows = data.split(/\r?\n/);

  const grid: string[] = [];
  for (const line of rows) {
    for (const ch of line) {
      grid.push(ch);
    }
  }

  return grid;
}
