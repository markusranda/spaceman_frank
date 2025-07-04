import { sprites } from "./sprites.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

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

  constructor(x, y, angle, radius) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.radius = radius;
    this.sprite = new PIXI.Sprite(sprites["fireball"]);
    this.sprite.name = "projectile";
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.width = radius * 2;
    this.sprite.height = radius * 2;
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
