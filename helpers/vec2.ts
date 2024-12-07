export default class Vec2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(other: Vec2) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  addTo(other: Vec2) {
    this.x += other.x;
    this.y += other.y;
  }

  copy(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  outOfBoundsSquare(size: number): boolean {
    return this.x < 0 || this.x > size-1 || this.y < 0 || this.y > size-1;
  }

  toString() {
    return `${this.x},${this.y}`
  }
}
