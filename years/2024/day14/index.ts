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
  simulateRobots(robots, 100, room);

  const q1 = robots.filter(r => r.pos.x < center.x && r.pos.y < center.y).length;
  const q2 = robots.filter(r => r.pos.x > center.x && r.pos.y < center.y).length;
  const q3 = robots.filter(r => r.pos.x < center.x && r.pos.y > center.y).length;
  const q4 = robots.filter(r => r.pos.x > center.x && r.pos.y > center.y).length;
  let task2 = simulateRobots(robots, 100000, room) + 100;

  const task1 = q1 * q2 * q3 * q4;;

  return [task1, task2]
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

function simulateRobots(robots: Robot[], seconds: number, room: Vec2): number {
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
    let check = checkTree(robots, room, s);
    if(check!== -1) {
      return check;
    }
  }
  return -1;
}

function checkTree(robots: Robot[], room: Vec2, seconds: number): number {
  //console.log(`Check ${seconds}`)
  const depth = 3;
  for (let robot of robots) {
    let foundTree = false;
    let legLeft = Vec2.create(robot.pos.x, robot.pos.y);
    let legRight = Vec2.create(robot.pos.x, robot.pos.y);
    let left = Vec2.create(-1, 1);
    let right = Vec2.create(1, 1);
    Vec2.addTo(legLeft, left);
    Vec2.addTo(legRight, right);
    let check = 0;
    while (true) {
      let foundLeft = robots.find(r => Vec2.equals(r.pos, legLeft));
      let foundRight = robots.find(r => Vec2.equals(r.pos, legRight));
      if (!foundLeft || !foundRight) break;
      //console.log('CHECK MORE')
      Vec2.addTo(legLeft, left);
      Vec2.addTo(legRight, right);
      check++;
      if(check > depth) {
        foundTree = true;
        break;
      }
    }

    if (foundTree) {
//      debug(room, robots);
//      console.log(`${seconds} second passed`)
//      await waitForSpacePress();
      return seconds + 1;
    }

  }

  return -1;
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


