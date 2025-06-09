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
  maxFuel = 2000;
  fuel = 2000;
  fuelConsumption = 0.5;
  lettersDelivered = 0;

  constructor(x, y) {
    this.sprite = sprites["frank"];
    this.radius = this.sprite.width / 2;
    this.x = x + this.sprite.width / 2;
    this.y = y + this.sprite.height / 2;
  }
}
