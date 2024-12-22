import { Vec2 } from "../vec2";
type Node = { point: Vec2; distance: number };

export class Dijkstras {
  private static dijkstraCore(
    grid: string[][],
    start: Vec2,
    end: Vec2
  ): { distance: number[][]; previous: Vec2[][][] } {
    const rows = grid.length;
    const cols = grid[0].length;

    const directions = [
      { x: 0, y: 1 }, // Down
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 }, // Right
      { x: -1, y: 0 } // Left
    ];

    const isValid = (point: Vec2): boolean =>
      point.x >= 0 &&
      point.x < cols &&
      point.y >= 0 &&
      point.y < rows &&
      grid[point.y][point.x] !== "#";

    const distance: number[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(Infinity)
    );
    const previous: Vec2[][][] = Array.from({ length: rows }, () =>
      Array(cols)
        .fill(null)
        .map(() => [])
    );

    distance[start.y][start.x] = 0;

    const queue: Node[] = [{ point: start, distance: 0 }];

    while (queue.length > 0) {
      // Sort queue by distance (priority queue behavior)
      queue.sort((a, b) => a.distance - b.distance);
      const { point, distance: dist } = queue.shift()!;

      // If we've reached the end, we can optionally break early for efficiency,
      // but it's not strictly necessary.
      // if (point.x === end.x && point.y === end.y) break;

      // Check all neighbors
      for (const dir of directions) {
        const neighbor = { x: point.x + dir.x, y: point.y + dir.y };

        if (isValid(neighbor)) {
          const newDist = dist + 1; // Cost is always 1 for adjacent nodes
          if (newDist < distance[neighbor.y][neighbor.x]) {
            // Found a shorter path
            distance[neighbor.y][neighbor.x] = newDist;
            previous[neighbor.y][neighbor.x] = [point]; // Replace with this point
            queue.push({ point: neighbor, distance: newDist });
          } else if (newDist === distance[neighbor.y][neighbor.x]) {
            // Found an equally short path, add to previous
            previous[neighbor.y][neighbor.x].push(point);
          }
        }
      }
    }

    return { distance, previous };
  }

  // Find a single shortest path
  static findShortestPath(grid: string[][], start: Vec2, end: Vec2): Vec2[] {
    const { previous } = this.dijkstraCore(grid, start, end);

    // Backtrack to find a single path
    const path: Vec2[] = [];
    let current: Vec2 | null = end;

    while (current) {
      path.push(current);
      const prev: Vec2[] = previous[current.y][current.x];
      current = prev.length > 0 ? prev[0] : null; // Pick the first previous node
    }

    return path.reverse();
  }

  // Find all shortest paths
  static findAllShortestPaths(
    grid: string[][],
    start: Vec2,
    end: Vec2
  ): Vec2[][] {
    const { previous } = this.dijkstraCore(grid, start, end);

    // Backtrack recursively to find all shortest paths
    const paths: Vec2[][] = [];
    const backtrack = (current: Vec2, path: Vec2[]) => {
      if (current.x === start.x && current.y === start.y) {
        paths.push([current, ...path]); // Add path with current node
        return;
      }
      for (const prev of previous[current.y][current.x]) {
        backtrack(prev, [current, ...path]);
      }
    };

    backtrack(end, []);
    return paths;
  }

  private static isValid(grid: string[][], point: Vec2): boolean {
    const rows = grid.length;
    const cols = grid[0].length;
    return (
      point.x >= 0 &&
      point.x < cols &&
      point.y >= 0 &&
      point.y < rows &&
      grid[point.y][point.x] !== "#"
    );
  }

  // Find all possible paths (not necessarily shortest)
  static findAllPaths(
    grid: string[][],
    start: Vec2,
    end: Vec2,
    maxPaths: number = Infinity
  ): Vec2[][] {
    const directions = [
      { x: 0, y: 1 }, // Down
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 }, // Right
      { x: -1, y: 0 } // Left
    ];

    const paths: Vec2[][] = [];

    const backtrack = (current: Vec2, path: Vec2[], visited: Set<string>) => {
      // If we've found enough paths, stop searching
      if (paths.length >= maxPaths) return;

      const key = `${current.x},${current.y}`;
      // If already visited in this path, no need to continue
      if (visited.has(key)) return;

      // Mark current node as visited
      visited.add(key);
      // Add current node to path
      path.push(current);

      // If we've reached the end, record this path
      if (current.x === end.x && current.y === end.y) {
        paths.push([...path]);
        // Backtrack
        path.pop();
        visited.delete(key);
        return;
      }

      // Explore neighbors
      for (const dir of directions) {
        const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
        if (this.isValid(grid, neighbor)) {
          backtrack(neighbor, path, visited);
        }
      }

      // Backtrack: remove current node from path and visited set
      path.pop();
      visited.delete(key);
    };

    backtrack(start, [], new Set<string>());
    return paths;
  }
}
