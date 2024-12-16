import { join } from "path";
import { parseFileToGrid } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { Direction, DirectionHelper } from "../../../helpers/direction";
import {
  AStar,
  GetNeighborsFunction,
  Node
} from "../../../helpers/pathfinding/aStar";

const movementCosts = {
  straightCost: 1,
  turnPenalty: 1000
};

const gridSymbols = {
  walkable: [".", "S", "E"],
  wall: ["#"] 
};

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let grid = await parseFileToGrid(filePath);

  let start: Vec2 = Vec2.create();
  let end: Vec2 = Vec2.create();
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "S") start = Vec2.create(x, y);
      if (grid[y][x] === "E") end = Vec2.create(x, y);
    }
  }


  const aStar = new AStar(grid, {}, gridNeighborFunction);
  const bestPaths = aStar.findAllBestPaths(start, end, Direction.East);
  
  let task1 = 0;
  let task2 = 0;
  
  if (bestPaths.length > 0) {
    task1 = bestPaths[0][bestPaths[0].length - 1].cost;

    let positions = new Set<string>();
    for (let path of bestPaths) {
      for (let node of path) {
        positions.add(`x:${node.x},y:${node.y}`);
      }
    }
    task2 = positions.size;
  }

  return [task1, task2];
}

export const gridNeighborFunction: GetNeighborsFunction = (
  node: Node,
  grid: string[][],
  end: Vec2
): Node[] => {
  const { x, y, direction, g } = node;
  const neighbors: Node[] = [];
  // Move Forward
  {
    const dir = DirectionHelper.getVector(direction);
    const nx = x + dir.x;
    const ny = y + dir.y;
    if (isWalkable(nx, ny, grid)) {
      neighbors.push({
        x: nx,
        y: ny,
        direction: direction,
        g: g + movementCosts.straightCost,
        f: 0, 
        parents: [node]
      });
    }
  }

  // Turn Left and Move
  {
    const newDirection = DirectionHelper.turnLeft(direction);
    const dir = DirectionHelper.getVector(newDirection);
    const nx = x + dir.x;
    const ny = y + dir.y;
    if (isWalkable(nx, ny, grid)) {
      neighbors.push({
        x: nx,
        y: ny,
        direction: newDirection,
        g: g + movementCosts.straightCost + movementCosts.turnPenalty,
        f: 0,
        parents: [node]
      });
    }
  }

  // Turn Right and Move
  {
    const newDirection = DirectionHelper.turnRight(direction);
    const dir = DirectionHelper.getVector(newDirection);
    const nx = x + dir.x;
    const ny = y + dir.y;
    if (isWalkable(nx, ny, grid)) {
      neighbors.push({
        x: nx,
        y: ny,
        direction: newDirection,
        g: g + movementCosts.straightCost + movementCosts.turnPenalty,
        f: 0,
        parents: [node]
      });
    }
  }

  return neighbors;
};

function isWalkable(x: number, y: number, grid: string[][]): boolean {
  return (
    y >= 0 &&
    y < grid.length &&
    x >= 0 &&
    x < grid[0].length &&
    gridSymbols.walkable.includes(grid[y][x])
  );
}