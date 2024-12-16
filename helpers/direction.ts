import { Vec2 } from "./vec2";

export enum Direction {
  North,
  East,
  South,
  West
}

export class DirectionHelper {
  // Mapping each direction to its movement vector
  public static directionVectors: Record<Direction, Vec2> = {
    [Direction.North]: { x: 0, y: -1 },
    [Direction.East]: { x: 1, y: 0 },
    [Direction.South]: { x: 0, y: 1 },
    [Direction.West]: { x: -1, y: 0 }
  };

  // Mapping for turning left from each direction
  public static leftTurn: Record<Direction, Direction> = {
    [Direction.North]: Direction.West,
    [Direction.West]: Direction.South,
    [Direction.South]: Direction.East,
    [Direction.East]: Direction.North
  };

  // Mapping for turning right from each direction
  public static rightTurn: Record<Direction, Direction> = {
    [Direction.North]: Direction.East,
    [Direction.East]: Direction.South,
    [Direction.South]: Direction.West,
    [Direction.West]: Direction.North
  };

  /**
   * Retrieves the movement vector for a given direction.
   * @param direction The current direction.
   * @returns An object containing dx and dy.
   */
  public static getVector(direction: Direction): Vec2 {
    return this.directionVectors[direction];
  }

  /**
   * Calculates the new direction after turning left.
   * @param direction The current direction.
   * @returns The new direction after a left turn.
   */
  public static turnLeft(direction: Direction): Direction {
    return this.leftTurn[direction];
  }

  /**
   * Calculates the new direction after turning right.
   * @param direction The current direction.
   * @returns The new direction after a right turn.
   */
  public static turnRight(direction: Direction): Direction {
    return this.rightTurn[direction];
  }

  /**
   * Retrieves the opposite direction.
   * @param direction The current direction.
   * @returns The opposite direction.
   */
  public static opposite(direction: Direction): Direction {
    switch (direction) {
      case Direction.North:
        return Direction.South;
      case Direction.East:
        return Direction.West;
      case Direction.South:
        return Direction.North;
      case Direction.West:
        return Direction.East;
      default:
        throw new Error("Invalid Direction");
    }
  }

  /**
   * Converts a direction enum to its string representation.
   * @param direction The direction to convert.
   * @returns The string representation of the direction.
   */
  public static toString(direction: Direction): string {
    switch (direction) {
      case Direction.North:
        return "North";
      case Direction.East:
        return "East";
      case Direction.South:
        return "South";
      case Direction.West:
        return "West";
      default:
        return "Unknown";
    }
  }

  /**
   * Converts a string to its corresponding direction enum.
   * @param directionStr The string representation of the direction.
   * @returns The corresponding direction enum, or undefined if invalid.
   */
  public static fromString(directionStr: string): Direction | undefined {
    switch (directionStr.toLowerCase()) {
      case "north":
        return Direction.North;
      case "east":
        return Direction.East;
      case "south":
        return Direction.South;
      case "west":
        return Direction.West;
      default:
        return undefined;
    }
  }

  /**
   * Lists all available directions.
   * @returns An array of all Direction enums.
   */
  public static getAllDirections(): Direction[] {
    return [Direction.North, Direction.East, Direction.South, Direction.West];
  }
}
