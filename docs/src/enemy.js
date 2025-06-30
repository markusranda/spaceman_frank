import { sprites } from "./sprites.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

export const MAX_ATTACK_TIMER = 2000;

export class Enemy {
  x = 0;
  y = 0;
  radius = 40;
  speed = 2;
  type = "enemy";
  sprite = null;
  attackTimer = MAX_ATTACK_TIMER;
  attackRange = 600;
  dead = false;

  constructor(frank, galaxy) {
    const { x, y } = this.getValidSpawnCoords(frank, galaxy);
    this.x = x;
    this.y = y;
    this.sprite = new PIXI.Sprite(sprites["enemy_1"]);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.width = this.radius * 2;
    this.sprite.height = this.radius * 2;
  }

  addTo(container) {
    if (!this.sprite.added) {
      container.addChild(this.sprite);
      this.sprite.x = this.x - this.radius;
      this.sprite.y = this.y - this.radius;
      this.sprite.added = true;
      this.sprite.cullable = true;
    }
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

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.x = x;
    this.sprite.y = y;
  }

  destroy() {
    this.sprite.destroy({ children: true, texture: false, baseTexture: false });
  }
}
