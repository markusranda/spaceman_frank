import { sprites } from "../index.js";

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
  maxFuel = 10000;
  fuel = 10000;
  fuelConsumption = 0.5;
  lettersDelivered = 0;
  upgrades = {};
  sonarRadius = 1500;
  sonarAngle = 0;
  sonarLetters = new Set();
  baseFrankRadius = 50;
  fullness = 0;

  constructor() {
    this.sprite = sprites["frank"];
    this.radius = this.baseFrankRadius;
    this.x = 0 - this.radius;
    this.y = 0 - this.radius;
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

  getFullnessGoal() {
    return 25;
  }

  eatPlanet(planet) {
    const maxEdible = this.radius * 0.75;
    const minEdible = this.radius * 0.5;

    // Guard - Frank can't eat the big ones
    if (planet.radius > maxEdible) return;

    if (planet.radius >= minEdible) {
      this.fullness += 1.0;
    } else {
      const levelDiff = Math.floor(Math.log2(this.radius / planet.radius));
      this.fullness += 1.0 / 2 ** levelDiff;
    }
  }
}
