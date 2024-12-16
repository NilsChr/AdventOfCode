// AStar.ts

import { Vec2 } from "../vec2";

// Define the Direction enum for cardinal directions
export enum Direction {
  North,
  East,
  South,
  West
}

// Define the Node interface for each grid cell
interface Node {
  x: number;
  y: number;
  direction: Direction;
  g: number; // Cost from start to this node
  f: number; // Total estimated cost (g + h)
  parent?: Node; // Reference to parent node for path reconstruction
  parents?: Node[]; // References to multiple parent nodes for multiple paths
}

// Priority Queue Implementation (Min-Heap)
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
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      this.bubbleDown();
    }
    return top;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public contains(node: T): boolean {
    return this.heap.includes(node);
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
          (swapIdx !== null &&
            this.comparator(rightChild, this.heap[swapIdx]) < 0)
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

// AStar Class
export class AStar {
  private grid: string[][];
  private turnPenalty: number;

  // Direction vectors for movement
  private directionVectors: Record<Direction, { dx: number; dy: number }> = {
    [Direction.North]: { dx: 0, dy: -1 },
    [Direction.East]: { dx: 1, dy: 0 },
    [Direction.South]: { dx: 0, dy: 1 },
    [Direction.West]: { dx: -1, dy: 0 }
  };

  // Turn mappings
  private leftTurn: Record<Direction, Direction> = {
    [Direction.North]: Direction.West,
    [Direction.West]: Direction.South,
    [Direction.South]: Direction.East,
    [Direction.East]: Direction.North
  };

  private rightTurn: Record<Direction, Direction> = {
    [Direction.North]: Direction.East,
    [Direction.East]: Direction.South,
    [Direction.South]: Direction.West,
    [Direction.West]: Direction.North
  };

  constructor(grid: string[][], turnPenalty: number = 1) {
    this.grid = grid;
    this.turnPenalty = turnPenalty;
  }

  // Heuristic Function: Manhattan Distance
  private heuristic(a: Vec2, b: Vec2): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }

  // Check if a cell is walkable (not a wall)
  private isWalkable(x: number, y: number): boolean {
    return (
      y >= 0 &&
      y < this.grid.length &&
      x >= 0 &&
      x < this.grid[0].length &&
      this.grid[y][x] !== "#"
    );
  }

  // Generate a unique key for each state
  private stateKey(x: number, y: number, d: Direction): string {
    return `${x},${y},${d}`;
  }

  // Get neighbors for a node
  private getNeighbors(node: Node, goal: Vec2): Node[] {
    const { x, y, direction, g } = node;
    const neighbors: Node[] = [];

    // Move Forward
    {
      const { dx, dy } = this.directionVectors[direction];
      const nx = x + dx;
      const ny = y + dy;
      if (this.isWalkable(nx, ny)) {
        neighbors.push({
          x: nx,
          y: ny,
          direction,
          g: g + 1, // straightCost = 1
          f: 0, // To be updated
          parent: node
        });
      }
    }

    // Turn Left and Move
    {
      const ndir = this.leftTurn[direction];
      const { dx, dy } = this.directionVectors[ndir];
      const nx = x + dx;
      const ny = y + dy;
      if (this.isWalkable(nx, ny)) {
        neighbors.push({
          x: nx,
          y: ny,
          direction: ndir,
          g: g + 1 + this.turnPenalty, // straightCost + turnPenalty
          f: 0,
          parent: node
        });
      }
    }

    // Turn Right and Move
    {
      const ndir = this.rightTurn[direction];
      const { dx, dy } = this.directionVectors[ndir];
      const nx = x + dx;
      const ny = y + dy;
      if (this.isWalkable(nx, ny)) {
        neighbors.push({
          x: nx,
          y: ny,
          direction: ndir,
          g: g + 1 + this.turnPenalty,
          f: 0,
          parent: node
        });
      }
    }

    return neighbors;
  }

  /**
   * Finds the single best (lowest cost) path from start to end.
   * @param start Start position as Vec2.
   * @param end End position as Vec2.
   * @param startDirection Initial direction.
   * @returns Array of Vec2 representing the path, or null if no path found.
   */
  public findBestPath(
    start: Vec2,
    end: Vec2,
    startDirection: Direction
  ): Vec2[] | null {
    const openSet = new PriorityQueue<Node>((a, b) => a.f - b.f);
    const closedSet = new Set<string>();

    const startNode: Node = {
      x: start.x,
      y: start.y,
      direction: startDirection,
      g: 0,
      f: this.heuristic(start, end),
      parent: undefined
    };

    openSet.enqueue(startNode);

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue()!;
      const currentKey = this.stateKey(current.x, current.y, current.direction);

      // If the current node is the goal, reconstruct the path
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }

      // Add current node to closed set
      closedSet.add(currentKey);

      // Explore neighbors
      const neighbors = this.getNeighbors(current, end);
      for (const neighbor of neighbors) {
        const neighborKey = this.stateKey(
          neighbor.x,
          neighbor.y,
          neighbor.direction
        );

        // If neighbor is already evaluated, skip
        if (closedSet.has(neighborKey)) continue;

        // Calculate tentative g score
        const tentativeG = neighbor.g;

        // Check if this path to neighbor is better
        let inOpenSet = false;
        for (const node of openSet.heap) {
          if (
            node.x === neighbor.x &&
            node.y === neighbor.y &&
            node.direction === neighbor.direction
          ) {
            inOpenSet = true;
            if (tentativeG < node.g) {
              node.g = tentativeG;
              node.f = node.g + this.heuristic({ x: node.x, y: node.y }, end);
              node.parent = current;
              // Re-enqueue to update the position in the priority queue
              openSet.enqueue(node);
            }
            break;
          }
        }

        if (!inOpenSet) {
          // Set f score
          neighbor.f =
            tentativeG + this.heuristic({ x: neighbor.x, y: neighbor.y }, end);
          openSet.enqueue(neighbor);
        }
      }
    }

    // If openSet is empty and goal was not reached
    return null;
  }

  /**
   * Finds all best (lowest cost) paths from start to end.
   * @param start Start position as Vec2.
   * @param end End position as Vec2.
   * @param startDirection Initial direction.
   * @returns Array of paths, where each path is an array of Vec2, or empty array if no path found.
   */
  public findAllBestPaths(
    start: Vec2,
    end: Vec2,
    startDirection: Direction
  ): Vec2[][] {
    const openSet = new PriorityQueue<Node>((a, b) => a.f - b.f);
    const closedSet = new Map<string, number>(); // Map of stateKey to g cost
    const allEndNodes: Node[] = [];
    let minimalGoalCost: number | null = null;

    const startNode: Node = {
      x: start.x,
      y: start.y,
      direction: startDirection,
      g: 0,
      f: this.heuristic(start, end),
      parent: undefined,
      parents: []
    };

    openSet.enqueue(startNode);
    closedSet.set(this.stateKey(start.x, start.y, startDirection), 0);

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue()!;
      const currentKey = this.stateKey(current.x, current.y, current.direction);

      // If we've already found a minimal goal cost and current.f exceeds it, we can stop
      if (minimalGoalCost !== null && current.f > minimalGoalCost) {
        break;
      }

      // Check if current node is the goal
      if (current.x === end.x && current.y === end.y) {
        if (minimalGoalCost === null || current.g < minimalGoalCost) {
          // Found a better goal cost
          minimalGoalCost = current.g;
          allEndNodes.length = 0; // Clear previous nodes
        }
        if (current.g === minimalGoalCost) {
          allEndNodes.push(current);
        }
        continue; // Continue searching for other paths with the same minimal cost
      }

      // Explore neighbors
      const neighbors = this.getNeighbors(current, end);
      for (const neighbor of neighbors) {
        const neighborKey = this.stateKey(
          neighbor.x,
          neighbor.y,
          neighbor.direction
        );

        if (
          !closedSet.has(neighborKey) ||
          neighbor.g < closedSet.get(neighborKey)!
        ) {
          // Found a better path to this state
          closedSet.set(neighborKey, neighbor.g);
          neighbor.f =
            neighbor.g + this.heuristic({ x: neighbor.x, y: neighbor.y }, end);
          openSet.enqueue(neighbor);
        } else if (neighbor.g === closedSet.get(neighborKey)!) {
          // Found an alternative path with the same cost
          // Find the existing node in openSet or closedSet and add the current node as a parent
          // Note: This implementation assumes that nodes in openSet are unique per state
          const existingNode = openSet.heap.find(
            (n) =>
              n.x === neighbor.x &&
              n.y === neighbor.y &&
              n.direction === neighbor.direction
          );

          if (existingNode) {
            if (!existingNode.parents) {
              existingNode.parents = [];
            }
            existingNode.parents.push(current);
          } else {
            // If the node is not in openSet, it has already been processed
            // For simplicity, this implementation does not track all processed nodes for multiple parents
            // To fully support multiple paths, additional tracking is required
          }
        }
      }
    }

    // Reconstruct all paths from end nodes
    const allPaths: Vec2[][] = [];
    for (const endNode of allEndNodes) {
      const path = this.reconstructPath(endNode);
      if (path) {
        allPaths.push(path);
      }
    }

    return allPaths;
  }

  // Reconstruct the path from a single end node
  private reconstructPath(endNode: Node): Vec2[] | null {
    const path: Vec2[] = [];
    let current: Node | undefined = endNode;
    while (current) {
      path.push({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path.reverse();
  }

  // Reconstruct all paths from multiple end nodes
  private reconstructAllPaths(endNodes: Node[]): Vec2[][] {
    const allPaths: Vec2[][] = [];

    for (const endNode of endNodes) {
      const path = this.reconstructPath(endNode);
      if (path) {
        allPaths.push(path);
      }
    }

    return allPaths;
  }
}
