export class Vector2 {
  x = 0;
  y = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  normalize() {
    const length = Math.hypot(this.x, this.y);
    this.x = length > 0 ? this.x / length : 0;
    this.y = length > 0 ? this.y / length : 0;

    return this;
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }
}
