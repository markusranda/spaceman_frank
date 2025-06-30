import { sprites } from "./sprites.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

export class Particle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  ttl = 0;
  sprite = null;

  constructor(x, y, vx, vy, ttl) {
    this.x = x;
    this.y = y;
    this.sprite = this.getRandomSprite();
    this.sprite.x = x;
    this.sprite.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ttl = ttl;
  }

  getRandomSprite() {
    const particleSprites = [
      sprites["confetti_1"],
      sprites["confetti_1"],
      sprites["confetti_1"],
      sprites["confetti_1"],
    ];
    const index = Math.floor(Math.random() * particleSprites.length);
    return new PIXI.Sprite(particleSprites[index]);
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
