import { join } from "path";
import { parseFileToGrid } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { debugGrid, waitForSpacePress } from "../../../helpers/debug";
import {
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
        grid[y][x] = ".";
      }
      if (grid[y][x] === "E") {
        end = Vec2.create(x, y);
        grid[y][x] = ".";
      }
    }
  }
  debugGrid(grid, []);

  const aStar = new AStar(grid, {}, gridNeighborFunction);
  const path = aStar.findBestPath(start, end, Direction.East) || [];

  const masterPath = path.length;
  const distanceCache = new Map<string, number>();
  for (let i = 0; i < path.length; i++) {
    distanceCache.set(Vec2.toString(path[i]), path.length - i);
  }

  const walls = findCheatableWalls(grid);

  const tests: Vec2[] = [
    Vec2.create(8, 1),
    Vec2.create(6, 7),
    Vec2.create(10, 7),
    Vec2.create(8, 8)
  ];

  const saves = new Map<number, number>();
  let processed = 0;
  for (let w of walls) {

  

    const shortEnd = Math.min(
      distanceCache.get(Vec2.toString(w.from))!,
      distanceCache.get(Vec2.toString(w.to))!
    );
    const longEnd = Math.max(
      distanceCache.get(Vec2.toString(w.from))!,
      distanceCache.get(Vec2.toString(w.to))!
    );
    const newPathLength = (longEnd - shortEnd -2);
    saves.set(newPathLength, (saves.get(newPathLength) || 0) + 1);
/*
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
    console.log('newPathLength', newPathLength)
    console.log("Pos", w.pos);
    console.log("From", w.from, distanceCache.get(Vec2.toString(w.from)));
    console.log("To", w.to, distanceCache.get(Vec2.toString(w.to)));
    console.log("Saved Time: ", savedTime);
    */
  }

  //  console.log(saves);
  const keys = [...saves.keys()].sort((a, b) => a - b);
  // console.log(keys);
  let task1 = 0;
  for (let key of keys) {
    if(key >= 100) task1 += saves.get(key)!;
    console.log(
      `There are ${saves.get(key)} cheats that save ${key} picoseconds.`
    );
  }

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

      if (grid[hLeft.y][hLeft.x] === "." && grid[hRight.y][hRight.x] === ".") {
        const wall = Vec2.create(x, y);
        if (!walls.find((w) => Vec2.equals(wall, w.pos))) {
          walls.push({ pos: wall, from: hLeft, to: hRight });
        }
      }

      const vTop = Vec2.create(x, y - 1);
      const vBot = Vec2.create(x, y + 1);
      if (grid[vTop.y][vTop.x] === "." && grid[vBot.y][vBot.x] === ".") {
        const wall = Vec2.create(x, y);
        if (!walls.find((w) => Vec2.equals(wall, w.pos))) {
          walls.push({ pos: wall, from: vTop, to: vBot });
        }
      }
    }
  }

  return walls;
}
