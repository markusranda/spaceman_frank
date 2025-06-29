const TTL_MAX = 1000 * 30;

export class Projectile {
  x = 0;
  y = 0;
  radius = 10;
  angle = 0;
  ttl = TTL_MAX;
  speed = 10;

  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }
}
