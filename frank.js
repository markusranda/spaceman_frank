import { sprites } from "./index.js";

export class Frank {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  angle = (3 * Math.PI) / 2;
  acceleration = 0.05;
  rotationSpeed = 0.05;
  maxSpeed = 4;
  friction = 0.9945;
  sprite = undefined;
  radius = 0;
  letter = undefined;

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = sprites["frank"];
    this.radius = this.sprite.width / 2;
  }
}
