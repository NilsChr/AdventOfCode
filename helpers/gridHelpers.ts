import { Vec2 } from "./vec2";

export function getNeighbourCoords(grid: string[][] | number[][], pos: Vec2, diagonals: boolean = false): Vec2[] {
    const neighbours: Vec2[] = [];
    const { x, y } = pos;

    let directions: Vec2[] = [
        { x: x, y: y - 1 }, // Up
        { x: x, y: y + 1 }, // Down
        { x: x - 1, y: y }, // Left
        { x: x + 1, y: y }, // Right
    ];

    if (diagonals) {
        directions = [...directions,
        { x: x - 1, y: y - 1 }, // Top-left
        { x: x + 1, y: y - 1 }, // Top-right
        { x: x - 1, y: y + 1 }, // Bottom-left
        { x: x + 1, y: y + 1 }, // Bottom-right
        ]
    }

    for (const dir of directions) {
        if (
            dir.y >= 0 && dir.y < grid.length &&
            dir.x >= 0 && dir.x < grid[dir.y].length
        ) {
            neighbours.push(dir);
        }
    }

    return neighbours;
}

/**
 * Fast way to keep track of visited nodes on a grid  
 */
export function createBoolGrid(rows: number, cols: number): boolean[][] {
    return Array.from({ length: rows }, () => Array(cols).fill(false));
}

export function findCellsByValue(grid: string[][], value: string): Vec2[] {
    const out: Vec2[] = [];
    for(let y = 0; y < grid.length; y++) {
        for(let x = 0; x < grid[0].length; x++) {
            if(grid[y][x] === value) out.push(Vec2.create(x,y));
        }      
    }
    return out;
}