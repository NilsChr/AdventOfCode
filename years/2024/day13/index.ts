import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";
import { Vec2 } from "../../../helpers/vec2";
import { extractIntegers } from "../../../helpers/regexHelpers";

interface ClawGame {
  a: Vec2,
  b: Vec2,
  prize: Vec2
}

export async function run(dir: string): Promise<[number, number]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  const clawGames: ClawGame[] = [];
  for (let i = 0; i < lines.length; i += 4) {
    const a = extractIntegers(lines[i])
    const b = extractIntegers(lines[i + 1])
    const c = extractIntegers(lines[i + 2])

    const clawGame: ClawGame = {
      a: Vec2.create(a[0], a[1]),
      b: Vec2.create(b[0], b[1]),
      prize: Vec2.create(c[0], c[1])
    }

    clawGames.push(clawGame);
  }

  let task1 = 0;
  let task2 = 0;

  for (let game of clawGames) {
    task1 += checkGame(game, 0);
    task2 += checkGame(game, 10000000000000);
  }

  return [task1, task2]
}

function checkGame(game: ClawGame, extra: number): number {
  const prize = Vec2.copy(game.prize);
  Vec2.addTo(prize, Vec2.create(extra, extra));
  const bestCostCombo = solve(game, prize);
  if (!bestCostCombo) return 0;
  return (bestCostCombo.x * 3) + bestCostCombo.y;
}


function solve(game: ClawGame, prize: Vec2): Vec2 | null {
  let determinant = game.a.x * game.b.y - game.a.y * game.b.x
  if (determinant === 0) {
    return null
  }

  let numerator1 =  game.b.y * prize.x - game.b.x * prize.y
  let numerator2 = -game.a.y * prize.x + game.a.x * prize.y

  if (numerator1 % determinant !== 0 || numerator2 % determinant !== 0) {
    return null;
  }

  let n1 = numerator1 / determinant
  let n2 = numerator2 / determinant

  let position = Vec2.create(
    n1 * game.a.x + n2 * game.b.x,
    n1 * game.a.y + n2 * game.b.y
  )

  if (!Vec2.equals(position, prize)) {
    return null
  }
  return Vec2.create(n1, n2)
}