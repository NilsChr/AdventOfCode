import { Direction } from "../direction";
import PriorityQueue from "../priorityQueue";
import { Vec2 } from "../vec2";

/**
 * Represents the cost associated with moving.
 */
export interface MovementCosts {
  straightCost: number;
  turnPenalty: number;
}

/**
 * Represents the symbols used to denote walkable and unwalkable (wall) cells.
 */
export interface GridSymbols {
  walkable: string[];
  wall: string[];
}

/**
 * Represents the options/configuration for the A* algorithm.
 */
export interface AStarOptions {
  heuristic?: (a: Vec2, b: Vec2) => number; // Optional custom heuristic
}

/**
 * Represents a node in the A* search.
 */
export interface Node {
  x: number;
  y: number;
  direction: Direction;
  g: number; // Cost from start to this node
  f: number; // Total estimated cost (g + h)
  parents: Node[]; // References to parent nodes for multiple paths
}

export interface PathNode extends Vec2 {
  cost: number;
}

/**
 * Type definition for the neighbor generation function.
 */
export type GetNeighborsFunction = (
  node: Node,
  grid: string[][],
  end: Vec2
) => Node[];

export class AStar {
  private grid: string[][];
  private heuristicFunc: (a: Vec2, b: Vec2) => number;
  private getNeighbors: GetNeighborsFunction;

  constructor(
    grid: string[][],
    options: AStarOptions,
    getNeighbors: GetNeighborsFunction
  ) {
    this.grid = grid;
    this.heuristicFunc = options.heuristic || this.defaultHeuristic;
    this.getNeighbors = getNeighbors;
  }

  /**
   * Default heuristic function (Manhattan Distance).
   */
  private defaultHeuristic(a: Vec2, b: Vec2): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }

  /**
   * Generates a unique key for a node's state based on position and direction.
   */
  private stateKey(x: number, y: number, d: Direction): string {
    return `${x},${y},${d}`;
  }

  /**
   * Finds the single best (lowest cost) path from start to end.
   */
  public findBestPath(
    start: Vec2,
    end: Vec2,
    startDirection: Direction
  ): PathNode[] | null {
    const openSet = new PriorityQueue<Node>((a, b) => a.f - b.f);
    const closedSet = new Set<string>();

    const startNode: Node = {
      x: start.x,
      y: start.y,
      direction: startDirection,
      g: 0,
      f: this.heuristicFunc(start, end),
      parents: []
    };

    openSet.enqueue(startNode);

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue()!;
      const currentKey = this.stateKey(current.x, current.y, current.direction);
      // If the current node is the goal, reconstruct and return the path
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }

      // Add current node to closed set
      closedSet.add(currentKey);

      // Explore neighbors using the provided neighbor function
      const neighbors = this.getNeighbors(
        current,
        this.grid,
        end
      );
      for (const neighbor of neighbors) {
        const neighborKey = this.stateKey(
          neighbor.x,
          neighbor.y,
          neighbor.direction
        );

        // If neighbor is already evaluated, skip
        if (closedSet.has(neighborKey)) continue;

        // Calculate f score
        neighbor.f =
          neighbor.g +
          this.heuristicFunc({ x: neighbor.x, y: neighbor.y }, end);

        // Check if this path to neighbor is better
        let inOpenSet = false;
        for (const node of openSet.heap) {
          if (
            node.x === neighbor.x &&
            node.y === neighbor.y &&
            node.direction === neighbor.direction
          ) {
            inOpenSet = true;
            if (neighbor.g < node.g) {
              node.g = neighbor.g;
              node.f = neighbor.f;
              node.parents = [current];
              openSet.enqueue(node); // Re-enqueue to update its position
            } else if (neighbor.g === node.g) {
              node.parents.push(current); // Handle multiple parents for multiple paths
            }
            break;
          }
        }

        if (!inOpenSet) {
          openSet.enqueue(neighbor);
        }
      }
    }

    // If openSet is empty and goal was not reached
    return null;
  }

  /**
   * Reconstructs a single path from an end node to the start node.
   */
  private reconstructPath(endNode: Node): PathNode[] | null {
    const path: PathNode[] = [];
    let current: Node | undefined = endNode;

    while (current) {
      path.unshift({ x: current.x, y: current.y, cost: current.g });
      if (current.parents.length > 0) {
        current = current.parents[0]; // Follow the first parent
      } else {
        current = undefined;
      }
    }

    return path.length > 0 ? path : null;
  }

  /**
   * Finds all best (lowest cost) paths from start to end.
   */
  public findAllBestPaths(
    start: Vec2,
    end: Vec2,
    startDirection: Direction
  ): PathNode[][] {
    const openSet = new PriorityQueue<Node>((a, b) => a.f - b.f);
    const visited = new Map<string, number>();
    const allEndNodes: Node[] = [];
    let minimalGoalCost: number | null = null;

    const startNode: Node = {
      x: start.x,
      y: start.y,
      direction: startDirection,
      g: 0,
      f: this.heuristicFunc(start, end),
      parents: []
    };

    openSet.enqueue(startNode);
    visited.set(this.stateKey(start.x, start.y, startDirection), 0);

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

      // Explore neighbors using the provided neighbor function
      const neighbors = this.getNeighbors(
        current,
        this.grid,
        end
      );
      for (const neighbor of neighbors) {
        const neighborKey = this.stateKey(
          neighbor.x,
          neighbor.y,
          neighbor.direction
        );

        const existingG = visited.get(neighborKey);

        if (existingG === undefined || neighbor.g < existingG) {
          // Found a better path to this state
          visited.set(neighborKey, neighbor.g);
          neighbor.f =
            neighbor.g +
            this.heuristicFunc({ x: neighbor.x, y: neighbor.y }, end);
          openSet.enqueue(neighbor);
        } else if (neighbor.g === existingG) {
          // Found an alternative path with the same cost
          // Find the existing node in openSet and add current as a parent
          const existingNodes = openSet["heap"].filter(
            (n) =>
              n.x === neighbor.x &&
              n.y === neighbor.y &&
              n.direction === neighbor.direction
          );

          for (const node of existingNodes) {
            node.parents.push(current);
          }
        }
      }
    }

    // Reconstruct all paths from end nodes
    const allPaths: PathNode[][] = [];
    for (const endNode of allEndNodes) {
      const paths = this.reconstructPaths(endNode);
      allPaths.push(...paths);
    }

    return allPaths;
  }

  /**
   * Reconstructs all paths from an end node to the start node.
   */
  private reconstructPaths(endNode: Node): PathNode[][] {
    const paths: PathNode[][] = [];
    const path: PathNode[] = [];

    const recurse = (node: Node, currentPath: PathNode[]) => {
      currentPath.unshift({ x: node.x, y: node.y, cost: node.g });

      if (node.parents.length === 0) {
        paths.push([...currentPath]);
      } else {
        for (const parent of node.parents) {
          recurse(parent, currentPath);
        }
      }

      currentPath.shift();
    };

    recurse(endNode, path);

    return paths;
  }
}
