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
  upgrades = {};
  sonarRadius = 1500;
  sonarAngle = 0;
  sonarLetters = new Set();

  constructor(x, y) {
    this.sprite = sprites["frank"];
    this.radius = this.sprite.width / 2;
    this.x = x + this.sprite.width / 2;
    this.y = y + this.sprite.height / 2;
  }

  getMaxSpeed() {
    const upgrades = this.upgrades["max_speed"]?.level ?? 0;
    const factor = 1 + 0.2 * upgrades;
    return this.maxSpeed * factor;
  }

  getAcceleration() {
    const upgrades = this.upgrades["acceleration"]?.level ?? 0;
    const factor = 1 + 0.15 * upgrades;
    return this.acceleration * factor;
  }
  getFuelConsumption() {
    const upgrades = this.upgrades["fuel_consumption"]?.level ?? 0;
    const factor = Math.pow(0.95, upgrades);
    return this.fuelConsumption * factor;
  }
}
