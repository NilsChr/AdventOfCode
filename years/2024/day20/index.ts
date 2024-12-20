import { join } from "path";
import { parseFileToGrid, parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { debugGrid } from "../../../helpers/debug";
import { Dijkstras } from "../../../helpers/pathfinding/dijkstra";
import { createBoolGrid, getNeighbourCoords } from "../../../helpers/gridHelpers";
import { sleep } from "../../../helpers/time";
import { AStar, GetNeighborsFunction, Node } from "../../../helpers/pathfinding/aStar";
import { Direction } from "../../../helpers/direction";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let grid = await parseFileToGrid(filePath);

  let start = Vec2.create();
  let end = Vec2.create();
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'S') {
        start = Vec2.create(x, y);
        grid[y][x] === '.'
      }
      if (grid[y][x] === 'E') {
        end = Vec2.create(x, y);
        grid[y][x] === '.'
      }
    }
  }

  const aStar = new AStar(grid, {}, gridNeighborFunction);
  const path =
    aStar.findBestPath(start, end, Direction.East) ||
    [];

  const masterPath = path.length;





  const walls = findCheatableWalls(grid);
  //const walls = [Vec2.create(10,7)];
  const saves = new Map<number, number>();
  let processed = 0;

  for (let w of walls) {
    grid[w.y][w.x] = '.'
    //const aStar = new AStar(grid, {}, gridNeighborFunction);
    const path =
      aStar.findBestPath(start, end, Direction.East) ||
      [];

    const dist = masterPath - path.length;
    if (dist > 0) {
      saves.set(dist, (saves.get(dist) || 0) + 1);
    }

    grid[w.y][w.x] = '#'
    //console.log(`${processed++}/${walls.length}`)
  }

  console.log(saves);
  const keys = [...saves.keys()].sort((a, b) => a - b);
  console.log(keys);
  for (let key of keys) {
    console.log(`There are ${saves.get(key)} cheats that save ${key} picoseconds.`)
  }
  /*
    
    debugGrid(grid, walls.map(w => {
      return {
        pos: w,
        char: 'X'
      }
    }), false)
  */

  /*
  grid[1][8] = "."
  grid[1][12] = "#"

  await solve(grid, start, end);
  */
  //grid[1][8] = "."

  //grid[7][10] = "."
  /*const aStar = new AStar(grid, {}, gridNeighborFunction);
  const path =
    aStar.findBestPath(start, end, Direction.East) ||
    [];
  */

  /*
for (let p of path) {
  await sleep(10);
  debugGrid(grid, [{ pos: p, char: '0' }])
}
console.log(path.length);
*/

  const task1 = 0;
  const task2 = 0;

  return [task1, task2]
}

export const gridNeighborFunction: GetNeighborsFunction = (
  node: Node,
  grid: string[][]
): Node[] => {
  const { x, y, direction, g } = node;
  const neighbors: Node[] = [];

  const nCells = getNeighbourCoords(grid, Vec2.create(x, y), false);
  for (let n of nCells) {
    if (grid[n.y][n.x] !== "#") {
      neighbors.push({
        x: n.x,
        y: n.y,
        direction: direction,
        g: g,
        f: 0,
        parents: [node]
      });
    }
  }

  return neighbors;
};

function findCheatableWalls(grid: string[][]): Vec2[] {
  const walls: Vec2[] = []
  // Horizontal
  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[0].length - 1; x++) {
      if (grid[y][x] !== '#') continue



      if (grid[y][x - 1] === '.' && grid[y][x + 1] === '.') {
        const wall = Vec2.create(x, y);
        if (!walls.find(w => Vec2.equals(wall, w))) {
          walls.push(wall);
        }
      }
      if (grid[y - 1][x] === '.' && grid[y + 1][x] === '.') {
        const wall = Vec2.create(x, y);
        if (!walls.find(w => Vec2.equals(wall, w))) {
          walls.push(wall);
        }
      }
    }
  }


  return walls;
}