import { sprites } from "./sprites.js";

export const MAX_ATTACK_TIMER = 2000;

export class Enemy {
  x = 0;
  y = 0;
  radius = 25;
  speed = 2;
  type = "enemy";
  sprite = sprites["enemy_1"];
  attackTimer = MAX_ATTACK_TIMER;
  attackRange = 600;

  constructor(frank, galaxy) {
    const { x, y } = this.getValidSpawnCoords(frank, galaxy);
    this.x = x;
    this.y = y;
  }

  getValidSpawnCoords(frank, galaxy) {
    const maxAttempts = 1000;
    const minDist = 600;
    const maxDist = 1200;

    for (let i = 0; i < maxAttempts; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = minDist + Math.random() * (maxDist - minDist); // enforce min distance
      const x = frank.x + Math.cos(angle) * dist;
      const y = frank.y + Math.sin(angle) * dist;

      const collidesWithPlanet = galaxy.planets.some((planet) => {
        const dx = x - planet.x;
        const dy = y - planet.y;
        const distance = Math.hypot(dx, dy);
        return distance < planet.radius + this.radius + 10; // buffer
      });

      if (!collidesWithPlanet) return { x, y };
    }

    throw Error(`Failed to find a valid position after ${maxAttempts}`);
  }
}
