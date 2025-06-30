import { sprites } from "./sprites.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.0.2/dist/pixi.mjs";

const TTL_MAX = 1000 * 5;

export class Projectile {
  x = 0;
  y = 0;
  radius = 10;
  angle = 0;
  ttl = TTL_MAX;
  speed = 10;
  damage = 100;
  sprite = null;
  dead = false;

  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.sprite = new PIXI.Sprite(sprites["fireball"]);
    this.sprite.x = x;
    this.sprite.y = y;
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
