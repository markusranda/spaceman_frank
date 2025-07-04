import { sprites } from "./sprites.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

export const MAX_ATTACK_TIMER = 2000;

export class Enemy {
  x = 0;
  y = 0;
  radius = 0;
  speed = 6;
  type = "enemy";
  sprite = null;
  attackTimer = MAX_ATTACK_TIMER;
  attackRange = 600;
  dead = false;
  debugCircle = null;

  constructor(galaxy, frank) {
    const { x, y } = this.getRandomEdgeSpawnCoords(galaxy);
    this.x = x;
    this.y = y;
    this.radius = frank.radius * 0.75;

    this.sprite = new PIXI.Sprite(sprites["enemy_1"]);
    this.sprite.name = "enemy_1";
    this.sprite.width = this.radius * 2;
    this.sprite.height = this.radius * 2;

    // Center sprite around enemy
    this.sprite.anchor.set(0.5);
    this.sprite.x = x;
    this.sprite.y = y;
  }

  addTo(container) {
    if (!this.sprite.added) {
      container.addChild(this.sprite);
      this.sprite.added = true;
      this.sprite.cullable = true;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.x = x;
    this.sprite.y = y;
  }

  getRandomEdgeSpawnCoords(galaxy) {
    const camera = galaxy.camera;
    const x0 = camera.x;
    const y0 = camera.y;
    const w = camera.width;
    const h = camera.height;

    const perimeter = 2 * (w + h);
    const p = Math.random() * perimeter;

    let x, y;

    if (p < w) {
      x = this.getPointOffset(x0 + p, 0);
      y = this.getPointOffset(y0, -1);
    } else if (p < w + h) {
      x = this.getPointOffset(x0 + w, 1);
      y = this.getPointOffset(y0 + (p - w), 0);
    } else if (p < 2 * w + h) {
      x = this.getPointOffset(x0 + (2 * w + h - p), 0);
      y = this.getPointOffset(y0 + h, 1);
    } else {
      x = this.getPointOffset(x0, -1);
      y = this.getPointOffset(y0 + (perimeter - p), 0);
    }

    return { x, y };
  }

  getPointOffset(px, dir) {
    const spawnOffset = this.radius * 4;
    return px + dir * spawnOffset;
  }

  destroy() {
    this.sprite.destroy({ children: true, texture: false, baseTexture: false });
  }
}
