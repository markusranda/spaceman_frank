import { sprites } from "./sprites";
import { Sprite } from "pixi.js";

export class Particle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  ttl = 0;
  sprite = new Sprite();

  constructor(x: number, y: number, vx: number, vy: number, ttl: number) {
    this.x = x;
    this.y = y;
    this.sprite.texture = this.getRandomSprite();
    this.sprite.label = "particle";
    this.sprite.x = x;
    this.sprite.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ttl = ttl;
  }

  getRandomSprite() {
    const particleSprites = [
      sprites["confetti_1"],
      sprites["confetti_2"],
      sprites["confetti_3"],
      sprites["confetti_4"],
    ];
    const index = Math.floor(Math.random() * particleSprites.length);
    return particleSprites[index];
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite.x = x;
    this.sprite.y = y;
  }

  destroy() {
    this.sprite.destroy({ children: true, texture: false });
  }
}
