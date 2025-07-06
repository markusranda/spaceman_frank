import { sprites } from "../sprites";
import { Container, Sprite } from "pixi.js";
import { DAMAGE_TIMER_MAX } from "../timers";
import { audios } from "../audio";
import {
  FRANK_ACCELERATION_BASE,
  FRANK_MAX_SPEED_BASE,
  FRANK_STATE,
} from "./const";
import { Galaxy } from "../galaxy";
import { SpaceTimers } from "../space_timers";
import { Entity } from "../entity";
import { Projectile } from "../projectile";
import { FrankJetpack } from "./jetpack";
import { FrankCharger } from "./charger";

export class Frank {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  angle = (3 * Math.PI) / 2;
  acceleration = FRANK_ACCELERATION_BASE;
  rotationSpeed = 0.08;
  maxSpeed = FRANK_MAX_SPEED_BASE;
  friction = 0.9945;

  container = new Container();
  frankSprite = new Sprite();
  radius = 0;
  baseRadius = 50;
  fullness = 0;
  level = 0;
  lastDmgAudioIndex = 0;
  lastEatAudioIndex = 0;
  state = FRANK_STATE.normal;
  jetpack = new FrankJetpack();
  charger = new FrankCharger();

  constructor() {
    this.container.label = "frank_container";
    this.frankSprite.texture = sprites["frank"];
    this.frankSprite.label = "frank_sprite";
    this.frankSprite.anchor.set(0.5);
    this.radius = this.baseRadius;
    this.x = 0;
    this.y = 0;
  }

  getFullnessGoal() {
    return 10;
  }

  setVelocity(acceleration: number, maxSpeed: number) {
    this.acceleration = acceleration;
    this.maxSpeed = maxSpeed;
    const dirX = Math.cos(this.angle);
    const dirY = Math.sin(this.angle);
    this.vx = dirX * maxSpeed;
    this.vy = dirY * maxSpeed;
  }

  update(
    delta: number,
    keys: Record<string, boolean>,
    galaxy: Galaxy,
    timers: SpaceTimers,
    container: Container
  ) {
    switch (this.state) {
      case FRANK_STATE.normal:
        this.jetpack.setColor(0xffff64);
        if (keys["w"]) this.jetpack.setThrusting(true);
        else this.jetpack.setThrusting(false);
        break;
      case FRANK_STATE.preCharging:
        this.jetpack.setColor(0xffff64);
        if (keys["w"]) this.jetpack.setThrusting(true);
        else this.jetpack.setThrusting(false);
        break;
      case FRANK_STATE.charging:
        this.jetpack.setColor(0x34cceb);
        this.jetpack.setThrusting(true);
        break;
      default:
        console.error(`Unknown state: ${this.state}`);
    }

    this.charger.update(
      delta,
      keys,
      this.state,
      this.frankSprite,
      container,
      this.enterState.bind(this),
      this.setVelocity.bind(this)
    );
    this.updateCommon(keys, delta, galaxy, timers);
  }

  updateCommon(
    keys: Record<string, boolean>,
    delta: number,
    galaxy: Galaxy,
    timers: SpaceTimers
  ) {
    this.updateFrankMovement(delta, keys, galaxy, timers);
    this.updateVisuals();
    this.jetpack.update(this.radius);
  }

  enterState(newState: string) {
    console.log(this.state);
    if (this.state !== newState) {
      this.state = newState;
    }
  }

  eatEntity(entity: Entity) {
    if (!entity.radius)
      throw Error(`Can't eat something without radius: ${entity}`);
    const maxEdible = this.radius * 0.75;
    const minEdible = this.radius * 0.5;

    // Guard - Frank can't eat the big ones
    if (entity.radius > maxEdible) return;

    if (entity.radius >= minEdible) {
      this.fullness += 1.0;
    } else {
      const levelDiff = Math.floor(Math.log2(this.radius / entity.radius));
      this.fullness += 1.0 / 2 ** levelDiff;
    }
  }

  evolve() {
    this.level++;
    this.fullness = 0;
    this.jetpack.resetFuel();

    const b = 147; // switch level
    const a = 205; // base radius after soft cap

    if (this.level < b) {
      this.radius = 50 + 35 * Math.log(this.level + 1); // early growth
    } else {
      this.radius = a + 4 * Math.log(this.level + 1); // soft-capped curve
    }

    console.log(`Level ${this.level} → Radius: ${this.radius.toFixed(2)}`);
  }

  addTo(container: Container) {
    this.container.addChild(this.frankSprite);
    this.container.addChild(this.jetpack.flameSprite);
    this.frankSprite.anchor.set(0.5);

    container.addChild(this.container);
  }

  updateVisuals() {
    this.container.x = this.x;
    this.container.y = this.y;
    this.container.rotation = this.angle + Math.PI / 2;
    let size = this.radius * 2;
    this.frankSprite.width = size;
    this.frankSprite.height = size;
  }

  updateFrankMovement(
    delta: number,
    keys: Record<string, boolean>,
    galaxy: Galaxy,
    timers: SpaceTimers
  ) {
    const dt = delta / 1000;
    const hasFuel = this.jetpack.hasFuel();
    const isThrusting = this.jetpack.thrusting;

    // === ROTATION ===
    if (keys.a) this.angle -= this.rotationSpeed;
    if (keys.d) this.angle += this.rotationSpeed;

    // === THRUST ===
    if (hasFuel && isThrusting) {
      this.vx += Math.cos(this.angle) * this.acceleration * dt;
      this.vy += Math.sin(this.angle) * this.acceleration * dt;
    }

    // === Clamp speed ===
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

    // === MOVE ===
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // === COLLISIONS ===
    const collisions: Entity[] = [];
    collisions.push(...this.detectCollisions(galaxy.planets));
    collisions.push(...this.detectCollisions(galaxy.enemies));
    const projectiles = this.detectCollisions(galaxy.projectiles);
    this.handleEdibleCollisions(collisions, timers, dt);
    this.handleProjectileCollisions(projectiles, timers);
  }

  handleProjectileCollisions(projectiles: Projectile[], timers: SpaceTimers) {
    for (const projectile of projectiles) {
      this.jetpack.damageFuelTank(projectile.damage);
      timers.damageTimer = DAMAGE_TIMER_MAX;
      projectile.dead = true;
    }
  }

  detectCollisions<T extends Entity>(objects: T[]) {
    const collisions: T[] = [];

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      const dx = this.x - obj.x;
      const dy = this.y - obj.y;
      const dist = Math.hypot(dx, dy);
      const minDist = this.radius + obj.radius;
      if (dist < minDist) {
        collisions.push(obj);
      }
    }

    return collisions;
  }

  handleEdibleCollisions(objects: Entity[], timers: SpaceTimers, dt: number) {
    const maxEdibleRadius = this.radius * 0.75;

    for (const obj of objects) {
      const isEdible = obj.radius <= maxEdibleRadius;

      if (isEdible) {
        obj.dead = true;
        this.eatEntity(obj);
        this.playEatSound();
      } else {
        this.handleCrash(obj, timers, dt);
      }
    }
  }

  handleCrash(obj: Entity, timers: SpaceTimers, dt: number) {
    // Vector from obj to Frank
    const dx = this.x - obj.x;
    const dy = this.y - obj.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    // Unit direction away from object
    const nx = dx / dist;
    const ny = dy / dist;

    // === Damage check BEFORE we overwrite velocity ===
    const relativeVx = this.vx;
    const relativeVy = this.vy;
    const impactSpeed = Math.abs(relativeVx * nx + relativeVy * ny);
    const damageThreshold = this.maxSpeed * 0.5;

    if (impactSpeed > damageThreshold) {
      const fuelLoss = this.jetpack.maxFuel / 16;
      this.jetpack.damageFuelTank(fuelLoss);
      timers.damageTimer = DAMAGE_TIMER_MAX;
      this.playDmgSound();
    }

    // === Apply knockback velocity ===
    this.vx = nx * impactSpeed;
    this.vy = ny * impactSpeed;

    // === Push out of the object (prevent overlap) ===
    const totalRadius = this.radius + obj.radius;
    const overlap = totalRadius - dist;
    if (overlap > 0) {
      this.x += nx * overlap;
      this.y += ny * overlap;
    }

    // ✅ One-frame knockback motion
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  playDmgSound() {
    const audioList = [audios["damage_1"], audios["damage_2"]];
    const index = (this.lastDmgAudioIndex + 1) % audioList.length;
    const audio = audioList[index];
    audio.audio.play();
    this.lastDmgAudioIndex = index;
  }

  playEatSound() {
    const audioList = [
      audios["eat_1"],
      audios["eat_2"],
      audios["eat_3"],
      audios["eat_4"],
      audios["eat_5"],
      audios["eat_6"],
    ];
    const index = (this.lastEatAudioIndex + 1) % audioList.length;
    const audio = audioList[index];
    audio.audio.play();
    this.lastEatAudioIndex = index;
  }
}
