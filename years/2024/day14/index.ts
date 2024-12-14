import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { extractIntegers } from "../../../helpers/regexHelpers";

interface Robot {
  pos: Vec2;
  vel: Vec2;
}

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  let robots: Robot[] = [];

  for (let line of lines) {
    robots.push(parseRobot(line))
  }

  const room = Vec2.create(101, 103)
  const center = Vec2.create(Math.floor(room.x / 2), Math.floor(room.y / 2));

  let safetyRatings: Vec2[] = [];
  for (let i = 0; i < (room.x * room.y); i++) {
    safetyRatings.push(Vec2.create(i, getSafetyRating(robots, center)));
    simulateRobots(robots, 1, room);
  }

  let task1 = safetyRatings[100];
  let task2 = safetyRatings.sort((a, b) => a.y - b.y)[0]


  return [task1.y, task2.x]
}

function parseRobot(line: string): Robot {
  const parts = line.split(" ");
  const pos = extractIntegers(parts[0]);
  const vel = extractIntegers(parts[1]);
  return {
    pos: Vec2.create(pos[0], pos[1]),
    vel: Vec2.create(vel[0], vel[1])
  }
}

function getSafetyRating(robots: Robot[], center: Vec2): number {
  const q1 = robots.filter(r => r.pos.x < center.x && r.pos.y < center.y).length;
  const q2 = robots.filter(r => r.pos.x > center.x && r.pos.y < center.y).length;
  const q3 = robots.filter(r => r.pos.x < center.x && r.pos.y > center.y).length;
  const q4 = robots.filter(r => r.pos.x > center.x && r.pos.y > center.y).length;

  return q1 * q2 * q3 * q4;
}

function simulateRobots(robots: Robot[], seconds: number, room: Vec2) {
  for (let s = 0; s < seconds; s++) {
    for (let robot of robots) {
      Vec2.addTo(robot.pos, robot.vel);
      if (robot.pos.x < 0) {
        robot.pos.x += room.x;
      } else if (robot.pos.x >= room.x) {
        robot.pos.x -= room.x;
      }

      if (robot.pos.y < 0) {
        robot.pos.y += room.y;
      } else if (robot.pos.y >= room.y) {
        robot.pos.y -= room.y;
      }
    }
  }
}

function debug(room: Vec2, robots: Robot[], center: Vec2 | null = null) {
  console.log();
  for (let y = 0; y < room.y; y++) {
    let s = ''
    for (let x = 0; x < room.x; x++) {
      let pos = Vec2.create(x, y);
      let nRobots = robots.filter(r => Vec2.equals(r.pos, pos)).length
      if (x === center?.x || y === center?.y) s += " ";
      else if (nRobots > 0) s += `${nRobots}`;
      else s += '.'
    }
    console.log(s);
  }
}