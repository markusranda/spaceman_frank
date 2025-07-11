import { Entity } from "./entity";
import { Frank } from "./frank/frank";
import { Universe } from "./universe/universe";
import { sprites } from "./sprites/sprites";
import { Container, Sprite } from "pixi.js";

export const MAX_ATTACK_TIMER = 2000;

export class Enemy extends Entity {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  angle = (3 * Math.PI) / 2;
  acceleration = 1250;
  maxSpeed = 400;
  radius = 0;
  speed = 6;
  type = "enemy";
  sprite = new Sprite();
  attackTimer = MAX_ATTACK_TIMER;
  attackRange = 600;
  debugCircle = null;

  constructor(universe: Universe, frank: Frank) {
    super();
    const { x, y } = this.getRandomEdgeSpawnCoords(universe);
    this.x = x;
    this.y = y;
    this.radius = frank.radius * 0.75;

    this.sprite.texture = sprites["enemy_1"]?.texture;
    this.sprite.label = "enemy_1";
    this.sprite.width = this.radius * 2;
    this.sprite.height = this.radius * 2;

    // Center sprite around enemy
    this.sprite.anchor.set(0.5);
    this.sprite.x = x;
    this.sprite.y = y;
  }

  addTo(container: Container) {
    if (this.sprite) {
      container.addChild(this.sprite);
      this.sprite.cullable = true;
    }
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite.x = x;
    this.sprite.y = y;
  }

  getRandomEdgeSpawnCoords(universe: Universe) {
    const camera = universe.camera;
    if (!camera)
      throw Error("Can't get randomEdgeSpawnCoords without universe.camera");
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

  getPointOffset(px: number, dir: number) {
    const spawnOffset = this.radius * 4;
    return px + dir * spawnOffset;
  }

  destroy() {
    this.sprite.destroy({ children: true, texture: false });
  }
}
