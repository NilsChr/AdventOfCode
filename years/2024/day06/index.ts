import { join } from "path";
import { parseFileToGrid } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";

interface GridMap {
  startPos: Vec2;
  grid: string[][];
}

const DIRECTIONS = {
  NORTH: Vec2.create(0, -1),
  SOUTH: Vec2.create(0, 1),
  WEST: Vec2.create(-1, 0),
  EAST: Vec2.create(1, 0),
};

class Guard {
  pos: Vec2;
  dir: Vec2;

  constructor(pos: Vec2) {
    this.pos = Vec2.copy(pos);
    this.dir = DIRECTIONS.NORTH;
  }

  turn() {
    switch (this.dir) {
      case DIRECTIONS.NORTH:
        this.dir = DIRECTIONS.EAST;
        break;
      case DIRECTIONS.EAST:
        this.dir = DIRECTIONS.SOUTH;
        break;
      case DIRECTIONS.SOUTH:
        this.dir = DIRECTIONS.WEST;
        break;
      case DIRECTIONS.WEST:
        this.dir = DIRECTIONS.NORTH;
        break;
    }
  }

  nextPos(): Vec2 {
    return Vec2.add(this.dir, this.pos);
  }

  icon() {
    switch (this.dir) {
      case DIRECTIONS.NORTH:
        return "^";
      case DIRECTIONS.EAST:
        return ">";
      case DIRECTIONS.SOUTH:
        return "v";
      case DIRECTIONS.WEST:
        return "<";
    }
  }
}

export async function run(dir: string) {
  const data: GridMap = {
    startPos: Vec2.create(),
    grid: [],
  };
  const filePath = join(dir, `${process.env.FILE}.txt`);
  data.grid = await parseFileToGrid(filePath);
  data.startPos = getStartPos(data.grid);
  data.grid[data.startPos.y][data.startPos.x] = ".";

  const visited = traverse(data.grid, data.startPos);
  let loops = 0;
  for (let pos of visited.values()) {
    data.grid[pos.y][pos.x] = "#";
    loops += check_loop(data.grid, data.startPos);
    data.grid[pos.y][pos.x] = ".";
  }

  return [visited.size, loops];
}

function getStartPos(grid: string[][]): Vec2 {
  const y = grid.findIndex((row) => row.includes("^"));
  return y === -1 ? Vec2.create() : Vec2.create(grid[y].indexOf("^"), y);
}

function traverse(grid: string[][], start: Vec2): Map<string, Vec2> {
  const visited: Map<string, Vec2> = new Map();
  const guard = new Guard(start);
  while (true) {
    const nextPos = guard.nextPos();
    if (Vec2.outOfBoundsSquare(nextPos, grid.length)) {
      break;
    }
    if (grid[nextPos.y][nextPos.x] === "#") {
      guard.turn();
    } else {
      guard.pos = nextPos;
      visited.set(Vec2.toString(nextPos), nextPos);
    }
  }
  return visited;
}

export function check_loop(grid: string[][], start: Vec2): number {
  const visited: Map<string, boolean> = new Map();
  const guard = new Guard(start);
  while (true) {
    const nextPos = guard.nextPos();
    const key = Vec2.toString(nextPos) + Vec2.toString(guard.dir);
    if (Vec2.outOfBoundsSquare(nextPos, grid.length)) {
      break;
    }
    if (visited.has(key)) {
      return 1;
    }
    if (grid[nextPos.y][nextPos.x] === "#") {
      guard.turn();
    } else {
      guard.pos = nextPos;
      visited.set(key, true);
    }
  }
  return 0;
}