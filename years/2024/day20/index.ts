import { join } from "path";
import { parseFileToGrid, parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { debugGrid, waitForSpacePress } from "../../../helpers/debug";
import { Dijkstras } from "../../../helpers/pathfinding/dijkstra";
import {
  createBoolGrid,
  getNeighbourCoords
} from "../../../helpers/gridHelpers";
import { sleep } from "../../../helpers/time";
import {
  AStar,
  GetNeighborsFunction,
  Node
} from "../../../helpers/pathfinding/aStar";
import { Direction } from "../../../helpers/direction";

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let grid = await parseFileToGrid(filePath);

  let start = Vec2.create();
  let end = Vec2.create();
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "S") {
        start = Vec2.create(x, y);
        grid[y][x] === ".";
      }
      if (grid[y][x] === "E") {
        end = Vec2.create(x, y);
        grid[y][x] === ".";
      }
    }
  }

  const aStar = new AStar(grid, {}, gridNeighborFunction);
  const path = aStar.findBestPath(start, end, Direction.East) || [];

  const masterPath = path.length;
  const distanceCache = new Map<string, number>();
  for (let i = 0; i < path.length; i++) {
    distanceCache.set(Vec2.toString(path[i]), path.length - i);
  }
  //console.log(path);
  //console.log(distanceCache.size)

  const walls = findCheatableWalls(grid);
  //console.log(walls);
  //const walls = [Vec2.create(10,7)];
  const saves = new Map<number, number>();
  let processed = 0;

  /*
  const testWall = walls[19]; //Vec2.create(8, 1);
  
  //console.log(walls.)
  console.log(testWall);
  console.log("from", distanceCache.get(Vec2.toString(testWall.from)));
  console.log("to", distanceCache.get(Vec2.toString(testWall.to)));

  const savedTime = Math.max(
    distanceCache.get(Vec2.toString(testWall.from))!,
    distanceCache.get(Vec2.toString(testWall.to))!
  );
  console.log("saved time", distanceCache.size - savedTime);
  */

  for (let w of walls) {
    const savedTime =
      Math.max(
        distanceCache.get(Vec2.toString(w.from))!,
        distanceCache.get(Vec2.toString(w.to))!
      );
    await waitForSpacePress();
    debugGrid(
      grid,
      [
        {
          pos: w.pos,
          char: "X"
        }
      ],
      false
    );
    console.log("Max: ", savedTime)
    console.log("Saved Time: ", distanceCache.size - savedTime);
    //    saves.set(savedTime, (saves.get(savedTime) || 0) + 1);
  }

  // const nDist = distanceCache.size

  /*
  debugGrid(
    grid,
    [
      {
        pos: testWall.pos,
        char: "X"
      }
    ],
    false
  );
  */

  /*
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
    */

  console.log(saves);
  const keys = [...saves.keys()].sort((a, b) => a - b);
  console.log(keys);
  for (let key of keys) {
    console.log(
      `There are ${saves.get(key)} cheats that save ${key} picoseconds.`
    );
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

  return [task1, task2];
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

function findCheatableWalls__(grid: string[][]): Vec2[] {
  const walls: Vec2[] = [];
  // Horizontal
  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[0].length - 1; x++) {
      if (grid[y][x] !== "#") continue;

      if (grid[y][x - 1] === "." && grid[y][x + 1] === ".") {
        const wall = Vec2.create(x, y);
        if (!walls.find((w) => Vec2.equals(wall, w))) {
          walls.push(wall);
        }
      }
      if (grid[y - 1][x] === "." && grid[y + 1][x] === ".") {
        const wall = Vec2.create(x, y);
        if (!walls.find((w) => Vec2.equals(wall, w))) {
          walls.push(wall);
        }
      }
    }
  }

  return walls;
}

interface PassableWall {
  pos: Vec2;
  from: Vec2;
  to: Vec2;
}

function findCheatableWalls(grid: string[][]): PassableWall[] {
  const walls: PassableWall[] = [];
  // Horizontal
  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[0].length - 1; x++) {
      if (grid[y][x] !== "#") continue;

      const hLeft = Vec2.create(x - 1, y);
      const hRight = Vec2.create(x + 1, y);

      if (grid[hLeft.x][hLeft.x] === "." && grid[hRight.y][hRight.x] === ".") {
        const wall = Vec2.create(x, y);
        if (!walls.find((w) => Vec2.equals(wall, w.pos))) {
          walls.push({ pos: wall, from: hLeft, to: hRight });
        }
      }

      const vTop = Vec2.create(x, y - 1);
      const vBot = Vec2.create(x, y + 1);
      if (grid[vTop.x][vTop.x] === "." && grid[vBot.y][vBot.x] === ".") {
        const wall = Vec2.create(x, y);
        if (!walls.find((w) => Vec2.equals(wall, w.pos))) {
          walls.push({ pos: wall, from: vTop, to: vBot });
        }
      }
    }
  }

  return walls;
}
