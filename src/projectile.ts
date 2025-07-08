import { Entity } from "./entity";
import { sprites } from "./sprites";
import { Sprite } from "pixi.js";

const TTL_MAX = 1000 * 5;

export class Projectile extends Entity {
  x = 0;
  y = 0;
  radius = 10;
  angle = 0;
  ttl = TTL_MAX;
  speed = 10;
  damage = 100;
  sprite = new Sprite(sprites["fireball"]?.texture);

  constructor(x: number, y: number, angle: number, radius: number) {
    super();
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.radius = radius;
    this.sprite.label = "projectile";
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.width = radius * 2;
    this.sprite.height = radius * 2;
  }
}
