export async function parseFileToString(filePath: string): Promise<string> {
  return await Bun.file(filePath).text();
}

export async function parseFileToRows(filePath: string): Promise<string[]> {
  const data = await Bun.file(filePath).text();
  // Split by newline; this handles both LF and CRLF
  return data.split(/\r?\n/);
}

export async function parseFileToInts(filePath: string): Promise<number[]> {
  const data = await Bun.file(filePath).text();
  const rows = data.split(/\r?\n/);

  const numbers: number[] = [];
  for (const line of rows) {
    const trimmed = line.trim();
    if (trimmed === "") continue; // Optionally skip empty lines
    const num = parseInt(trimmed, 10);
    if (Number.isNaN(num)) {
      throw new Error(`Failed to parse a line as i32: "${line}"`);
    }
    numbers.push(num);
  }

  return numbers;
}

export async function parseFileToGrid(filePath: string): Promise<string[][]> {
  const data = await Bun.file(filePath).text();
  const rows = data.split(/\r?\n/);
  return rows.map((line) => line.split(""));
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
