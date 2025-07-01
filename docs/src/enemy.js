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

  constructor(galaxy) {
    const { x, y } = this.getRandomEdgeSpawnCoords(galaxy);
    this.x = x;
    this.y = y;

    console.log(x, y);
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

  getRandomEdgeSpawnCoords(galaxy) {
    const camera = galaxy.camera;
    const x0 = camera.x; // top-left x
    const y0 = camera.y; // top-left y
    const w = camera.width;
    const h = camera.height;

    const perimeter = 2 * (w + h);
    const p = Math.random() * perimeter;

    // Flatten the perimeter to a line, then wrap back to a point
    let x, y;

    if (p < w) {
      // Top edge
      x = this.getPointOffset(x0 + p, 0);
      y = this.getPointOffset(y0, -1);
    } else if (p < w + h) {
      // Right edge
      x = this.getPointOffset(x0 + w, 1);
      y = this.getPointOffset(y0 + (p - w), 0);
    } else if (p < 2 * w + h) {
      // Bottom edge
      x = this.getPointOffset(x0 + (2 * w + h - p), 0);
      y = this.getPointOffset(y0 + h, 1);
    } else {
      // Left edge
      x = this.getPointOffset(x0, -1);
      y = this.getPointOffset(y0 + (perimeter - p), 0);
    }

    return { x, y };
  }

  getPointOffset(px, dir) {
    const spawnOffset = this.radius * 4;
    return px + dir * spawnOffset;
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
