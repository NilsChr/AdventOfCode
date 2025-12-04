import { join } from "path";
import { parseFileToGrid } from "../../../helpers/fileParser";
import { getNeighbourCoords } from "../../../helpers/gridHelpers";
import { Vec2 } from "../../../helpers/vec2";

export async function run(dir: string): Promise<[number,number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let input = await parseFileToGrid(filePath);

  let removableCoords = findRemovables(input);
  const task1 =removableCoords.length;
  let removed = 0;
  while(removableCoords.length > 0) {
    removed += removableCoords.length;
    for(let coord of removableCoords) {
      input[coord.y][coord.x] = '.'
    }
    removableCoords = findRemovables(input);
  }
  const task2 = removed;

  return [task1,task2]
}

function findRemovables(grid: string[][]): Vec2[] {
  let removable: Vec2[] = []
  for(let y = 0; y < grid.length; y++) {
    for(let x = 0; x < grid[y].length; x++) {
      if(grid[y][x] === '.') continue
      const neighbours = getNeighbourCoords(grid, {x,y}, true)
      let count = 0;
      for(let neighbour of neighbours) {
        if(grid[neighbour.y][neighbour.x] === '@') count++;
      }
      if(count < 4) removable.push({x,y})
    }
  }
  return removable;
}