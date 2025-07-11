import { Container, Sprite, Texture } from "pixi.js";
import { Entity } from "./entity";
import { detectEntityCollisions } from "./collisions";
import { Universe } from "./universe/universe";
import { Projectile } from "./projectile";

export class KageBunshin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  sprite = new Sprite();
  container = new Container();
  lifetime = -1;
  dead = false;

  constructor(
    x: number,
    y: number,
    angle: number,
    vx: number,
    vy: number,
    texture: Texture,
    radius: number,
    lifetime: number
  ) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.radius = radius;
    this.vx = vx;
    this.vy = vy;
    this.lifetime = lifetime;

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.width = this.radius * 2;
    this.sprite.height = this.radius * 2;
    this.sprite.alpha = 0.5;

    this.container.addChild(this.sprite);
    this.container.x = this.x;
    this.container.y = this.y;
    this.container.rotation = this.angle + Math.PI / 2;
  }

  update(universe: Universe, delta: number) {
    this.lifetime -= delta;

    if (this.lifetime <= 0) {
      this.dead = true;
    }

    this.updateMovement(delta);
    this.updateCollisions(universe);
  }

  updateMovement(delta: number) {
    const dt = delta / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.container.x = this.x;
    this.container.y = this.y;
  }

  updateCollisions(universe: Universe) {
    const collisions: Entity[] = [];
    collisions.push(
      ...detectEntityCollisions(universe.planets, this.x, this.y, this.radius)
    );
    collisions.push(
      ...detectEntityCollisions(universe.enemies, this.x, this.y, this.radius)
    );
    const projectiles = detectEntityCollisions(
      universe.projectiles,
      this.x,
      this.y,
      this.radius
    );
    this.handleEntityCrashes(collisions);
    this.handleProjectileCollisions(projectiles);
  }

  handleEntityCrashes(entities: Entity[]) {
    for (const entity of entities) {
      this.handleDamageEntity(entity);
    }
  }

  handleDamageEntity(entity: Entity) {
    const dmg = this.calculateDamage(entity);
    entity.health = Math.max(0, entity.health - dmg);
    this.dead = true;
  }

  calculateDamage(entity: Entity) {
    const f = this.radius;
    const e = entity.radius;

    if (f > e) return Infinity; // Instant kill

    const sizeRatio = f / e;

    // We want damage = 50 when sizeRatio = 1
    const damage = sizeRatio * 50;

    return Math.max(1, Math.floor(damage));
  }

  handleProjectileCollisions(projectiles: Projectile[]) {
    for (const projectile of projectiles) {
      projectile.dead = true;
    }
  }

  destroy() {
    this.container.destroy();
  }

  addTo(container: Container) {
    container.addChild(this.container);
  }
}
