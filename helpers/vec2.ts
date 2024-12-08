export type Vec2 = { x: number; y: number };
export const Vec2 = {
  create: (x: number = 0, y: number = 0): Vec2 => ({ x, y }),

  add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),

  addTo: (a: Vec2, b: Vec2): Vec2 => {
    a.x += b.x;
    a.y += b.y;
    return a;
  },

  copy: (a: Vec2): Vec2 => ({ x: a.x, y: a.y }),

  outOfBoundsSquare: (v: Vec2, size: number): boolean =>
    v.x < 0 || v.x > size - 1 || v.y < 0 || v.y > size - 1,

  lerp: (a: Vec2, b: Vec2, t: number): Vec2 => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  }),

  distanceTo: (a: Vec2, b: Vec2): number =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2),

  floor: (v: Vec2): Vec2 => {
    v.x = Math.floor(v.x);
    v.y = Math.floor(v.y);
    return v;
  },

  round: (v: Vec2): Vec2 => {
    v.x = Math.round(v.x);
    v.y = Math.round(v.y);
    return v;
  },

  normalizeZero: (v: Vec2) => {
    v.x = v.x === 0 ? 0 : v.x;
    v.y = v.y === 0 ? 0 : v.y;
  },

  equals: (a: Vec2, b: Vec2): boolean => a.x === b.x && a.y === b.y,

  toString: (v: Vec2): string => `${v.x},${v.y}`
};
