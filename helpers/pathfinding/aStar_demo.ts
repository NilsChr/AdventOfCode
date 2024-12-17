import { debugGrid } from "../debug";
import { Direction } from "../direction";
import { getNeighbourCoords } from "../gridHelpers";
import { Vec2 } from "../vec2";
import { AStar, GetNeighborsFunction, Node } from "./aStar";

function demo() {
  const grid = [
    ["#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", "#"],
    ["#", "#", "#", "#", ".", "#"],
    ["#", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", "#"],
    ["#", "#", "#", "#", "#", "#"]
  ];

  const aStar = new AStar(grid, {}, gridNeighborFunction);
  const path =
    aStar.findBestPath(Vec2.create(1, 1), Vec2.create(1, 5), Direction.East) ||
    [];

  debugGrid(
    grid,
    path.map((p) => {
      return {
        pos: Vec2.create(p.x, p.y),
        char: "O"
      };
    })
  );
}

export const gridNeighborFunction: GetNeighborsFunction = (
  node: Node,
  grid: string[][]
): Node[] => {
  const { x, y, direction, g } = node;
  const neighbors: Node[] = [];

  const nCells = getNeighbourCoords(grid, Vec2.create(x, y), true);
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

demo();
