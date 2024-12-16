import { join } from "path";
import { parseFileToGrid } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";

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
  lol();
  const turnPenalty = 1000; 

  const endNodes = aStarFindAllPathsWithPQ(grid, start, end, Direction.East, turnPenalty);
  let task1 = 0;
  let task2 = 0;
  if (endNodes.length > 0) {
    const allPaths = reconstructAllPaths(endNodes);
    task1 = allPaths[0][allPaths[0].length - 1].cost;

    let positions = new Set<string>();
    for (let path of allPaths) {
      for (let node of path) {
        positions.add(`x:${node.x},y:${node.y}`);
      }
    }
    task2 = positions.size;
    console.log(`Found ${allPaths.length} optimal path(s):`);
  } else {
    console.log("No path found");
  }

  return [task1, task2];
}

function lol() {

  {
    let a = 5;
    let b = 10;
    console.log(a+b);
  }

  {
    let a = 15;
    let b = 100;
    console.log(a+b);
  }

}

enum Direction {
  North,
  East,
  South,
  West
}

const directionVectors: Record<Direction, { dx: number; dy: number }> = {
  [Direction.North]: { dx: 0, dy: -1 },
  [Direction.East]: { dx: 1, dy: 0 },
  [Direction.South]: { dx: 0, dy: 1 },
  [Direction.West]: { dx: -1, dy: 0 }
};

const leftTurn: Record<Direction, Direction> = {
  [Direction.North]: Direction.West,
  [Direction.West]: Direction.South,
  [Direction.South]: Direction.East,
  [Direction.East]: Direction.North
};

const rightTurn: Record<Direction, Direction> = {
  [Direction.North]: Direction.East,
  [Direction.East]: Direction.South,
  [Direction.South]: Direction.West,
  [Direction.West]: Direction.North
};

const straightCost = 1;

interface Node {
  x: number;
  y: number;
  direction: Direction;
  g: number; // cost so far
  f: number; // g + heuristic
  parents: Node[]; // Multiple parents for multiple paths
}

function heuristic(a: Vec2, b: Vec2): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

function isWalkable(x: number, y: number, grid: string[][]): boolean {
  return (
    y >= 0 &&
    y < grid.length &&
    x >= 0 &&
    x < grid[0].length &&
    grid[y][x] !== "#"
  );
}

function stateKey(x: number, y: number, d: Direction): string {
  return `${x},${y},${d}`;
}

function getNeighbors(node: Node, grid: string[][], goal: Vec2, turnPenalty: number): Node[] {
  const { x, y, direction, g } = node;
  const neighbors: Node[] = [];

  // Move forward
  {
    const { dx, dy } = directionVectors[direction];
    const nx = x + dx;
    const ny = y + dy;
    if (isWalkable(nx, ny, grid)) {
      neighbors.push({
        x: nx,
        y: ny,
        direction,
        g: g + straightCost,
        f: 0, // To be updated
        parents: [node]
      });
    }
  }

  // Turn left and move
  {
    const ndir = leftTurn[direction];
    const { dx, dy } = directionVectors[ndir];
    const nx = x + dx;
    const ny = y + dy;
    if (isWalkable(nx, ny, grid)) {
      neighbors.push({
        x: nx,
        y: ny,
        direction: ndir,
        g: g + straightCost + turnPenalty,
        f: 0,
        parents: [node]
      });
    }
  }

  // Turn right and move
  {
    const ndir = rightTurn[direction];
    const { dx, dy } = directionVectors[ndir];
    const nx = x + dx;
    const ny = y + dy;
    if (isWalkable(nx, ny, grid)) {
      neighbors.push({
        x: nx,
        y: ny,
        direction: ndir,
        g: g + straightCost + turnPenalty,
        f: 0,
        parents: [node]
      });
    }
  }

  return neighbors;
}

class PriorityQueue<T> {
  heap: T[];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.heap = [];
    this.comparator = comparator;
  }

  public enqueue(item: T): void {
    this.heap.push(item);
    this.bubbleUp();
  }

  public dequeue(): T | undefined {
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0 && bottom !== undefined) {
      this.heap[0] = bottom;
      this.bubbleDown();
    }
    return top;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(): void {
    let index = this.heap.length - 1;
    const element = this.heap[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      if (this.comparator(element, parent) >= 0) break;
      this.heap[parentIndex] = element;
      this.heap[index] = parent;
      index = parentIndex;
    }
  }

  private bubbleDown(): void {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];

    while (true) {
      let leftChildIdx = 2 * index + 1;
      let rightChildIdx = 2 * index + 2;
      let swapIdx: number | null = null;

      if (leftChildIdx < length) {
        const leftChild = this.heap[leftChildIdx];
        if (this.comparator(leftChild, element) < 0) {
          swapIdx = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        const rightChild = this.heap[rightChildIdx];
        if (
          (swapIdx === null && this.comparator(rightChild, element) < 0) ||
          (swapIdx !== null && this.comparator(rightChild, this.heap[swapIdx]) < 0)
        ) {
          swapIdx = rightChildIdx;
        }
      }

      if (swapIdx === null) break;

      this.heap[index] = this.heap[swapIdx];
      this.heap[swapIdx] = element;
      index = swapIdx;
    }
  }
}

function aStarFindAllPathsWithPQ(
  grid: string[][],
  start: Vec2,
  end: Vec2,
  startDirection: Direction,
  turnPenalty: number
): Node[] {
  
  const openSet = new PriorityQueue<Node>((a, b) => a.f - b.f);
  const visited = new Map<string, number>();
  const processedNodes = new Map<string, Node[]>();
  const allEndNodes: Node[] = [];
  let minimalGoalCost: number | null = null;

  const startNode: Node = {
    x: start.x,
    y: start.y,
    direction: startDirection,
    g: 0,
    f: heuristic(start, end),
    parents: [],
  };

  openSet.enqueue(startNode);
  visited.set(stateKey(start.x, start.y, startDirection), 0);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue()!;

    const currentKey = stateKey(current.x, current.y, current.direction);
    if (!processedNodes.has(currentKey)) {
      processedNodes.set(currentKey, []);
    }
    processedNodes.get(currentKey)!.push(current);

    if (minimalGoalCost !== null && current.f > minimalGoalCost) {
      break;
    }

    if (current.x === end.x && current.y === end.y) {
      if (minimalGoalCost === null || current.g < minimalGoalCost) {
        minimalGoalCost = current.g;
        allEndNodes.length = 0;
      }
      if (current.g === minimalGoalCost) {
        allEndNodes.push(current);
      }
      continue;
    }

    const neighbors = getNeighbors(current, grid, end, turnPenalty);

    for (const neighbor of neighbors) {
      const key = stateKey(neighbor.x, neighbor.y, neighbor.direction);
      const existingCost = visited.get(key);

      if (existingCost === undefined || neighbor.g < existingCost) {
        visited.set(key, neighbor.g);
        neighbor.f = neighbor.g + heuristic({ x: neighbor.x, y: neighbor.y }, end);
        openSet.enqueue(neighbor);
      } else if (neighbor.g === existingCost) {
        const existingNodes = processedNodes.get(key);
        if (existingNodes) {
          for (const existingNode of existingNodes) {
            existingNode.parents.push(current);
          }
        }

        const nodesInOpenSet = openSet.heap.filter(n => stateKey(n.x, n.y, n.direction) === key);
        for (const nodeInOpenSet of nodesInOpenSet) {
          nodeInOpenSet.parents.push(current);
        }
      }
    }
  }

  return allEndNodes;
}

function reconstructAllPaths(endNodes: Node[]): { x: number; y: number; cost: number }[][] {
  const allPaths: { x: number; y: number; cost: number }[][] = [];

  for (const endNode of endNodes) {
    const paths = reconstructPathsFromNode(endNode);
    allPaths.push(...paths);
  }

  return allPaths;
}

function reconstructPathsFromNode(
  node: Node
): { x: number; y: number; cost: number }[][] {
  if (node.parents.length === 0) {
    return [[{ x: node.x, y: node.y, cost: node.g }]];
  }

  const paths: { x: number; y: number; cost: number }[][] = [];

  for (const parent of node.parents) {
    const parentPaths = reconstructPathsFromNode(parent);
    for (const path of parentPaths) {
      paths.push([...path, { x: node.x, y: node.y, cost: node.g }]);
    }
  }

  return paths;
}
