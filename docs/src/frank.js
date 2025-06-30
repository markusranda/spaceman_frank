import { sprites } from "./sprites.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.0.2/dist/pixi.mjs";
import { DAMAGE_TIMER_MAX } from "./timers.js";
import { audios } from "./audio.js";

export class Frank {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  angle = (3 * Math.PI) / 2;
  acceleration = 0.09;
  rotationSpeed = 0.05;
  maxSpeed = 15;
  friction = 0.9945;
  container = undefined;
  frankSprite = undefined;
  flameSprite = undefined;
  radius = 0;
  maxFuel = 5000;
  fuel = this.maxFuel;
  fuelConsumption = 0.5;
  upgrades = {};
  sonarRadius = 1500;
  sonarAngle = 0;
  sonarLetters = new Set();
  baseFrankRadius = 50;
  fullness = 0;
  lastDmgAudioIndex = 0;
  lastEatAudioIndex = 0;

  constructor() {
    const texture = sprites["frank"];
    this.container = new PIXI.Container();
    this.frankSprite = new PIXI.Sprite(texture);
    this.flameSprite = new PIXI.Graphics();
    this.frankSprite.anchor.set(0.5);
    this.radius = this.baseFrankRadius;
    this.x = 0;
    this.y = 0;
  }

  getMaxSpeed() {
    const upgrades = this.upgrades["max_speed"]?.level ?? 0;
    const factor = 1 + 0.2 * upgrades;
    return this.maxSpeed * factor;
  }

  getAcceleration() {
    const upgrades = this.upgrades["acceleration"]?.level ?? 0;
    const factor = 1 + 0.15 * upgrades;
    return this.acceleration * factor;
  }
  getFuelConsumption() {
    const upgrades = this.upgrades["fuel_consumption"]?.level ?? 0;
    const factor = Math.pow(0.95, upgrades);
    return this.fuelConsumption * factor;
  }

  getFullnessGoal() {
    return 10;
  }

  eatEntity(entity) {
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

  evolve(galaxy) {
    this.fullness = 0;
    this.fuel = this.maxFuel;
    this.radius += galaxy.stepSize;
  }

  addTo(container) {
    if (!this.frankSprite.added) {
      this.container.addChild(this.frankSprite);
      this.container.addChild(this.flameSprite);
      this.frankSprite.anchor.set(0.5);
      this.frankSprite.added = true;
      this.flameSprite.added = true;

      container.addChild(this.container);
    }
  }

  updateVisuals(keys) {
    this.container.x = this.x;
    this.container.y = this.y;
    this.container.rotation = this.angle + Math.PI / 2;
    let size = this.radius * 2;
    this.frankSprite.width = size;
    this.frankSprite.height = size;

    this.updateThrusterVisuals(keys);
  }

  updateThrusterVisuals(keys) {
    const g = this.flameSprite;
    g.clear();

    if (this.fuel <= 0 || !keys.w) {
      g.visible = false;
      return;
    }

    g.visible = true;

    const flameBase = this.radius * 1.2;
    const flameLength = this.radius * 2 + Math.random() * 40;

    const baseY = this.radius; // behind Frank (lower in local space)
    const tipY = baseY + flameLength;

    g.fill({ color: 0xff6400, alpha: 0.4 });
    g.moveTo(-flameBase / 2, baseY);
    g.quadraticCurveTo(0, baseY + flameLength * 0.5, 0, tipY);
    g.quadraticCurveTo(0, baseY + flameLength * 0.5, flameBase / 2, baseY);
    g.closePath();

    g.fill({ color: 0xffff64, alpha: 0.8 });
    g.circle(0, baseY + flameLength * 0.2, flameBase * 0.1);
  }

  updateThrusterAudio(keys) {
    const { gainNode, audio, audioCtx } = audios["thruster"];
    if (!gainNode || !audio || !audioCtx)
      throw Error("Failed to find audio for thruster");

    if (this.fuel <= 0) {
      gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      return;
    }

    if (keys["w"]) {
      if (audio.paused) {
        audio.play();
      }
      gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.05); // fade in
    } else {
      gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05); // fade out
    }
  }

  update(keys, galaxy, timers) {
    this.updateFrankFuel(keys);
    this.updateFrankMovement(keys, galaxy, timers);
    this.updateThrusterAudio(keys);
  }

  updateFrankMovement(keys, galaxy, timers) {
    const hasFuel = this.fuel > 0;

    // === ROTATION ===
    if (keys.a) this.angle -= this.rotationSpeed;
    if (keys.d) this.angle += this.rotationSpeed;

    // === THRUST ===
    if (hasFuel && keys.w) {
      const accel = this.getAcceleration();
      this.vx += Math.cos(this.angle) * accel;
      this.vy += Math.sin(this.angle) * accel;
    }

    // === Clamp speed ===
    const speed = Math.hypot(this.vx, this.vy);
    const maxSpeed = this.getMaxSpeed();
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

    // === MOVE ===
    this.x += this.vx;
    this.y += this.vy;

    // === COLLISIONS ===
    const collisions = [];
    collisions.push(...this.detectCollisions(galaxy.planets));
    collisions.push(...this.detectCollisions(galaxy.enemies));
    const projectiles = this.detectCollisions(galaxy.projectiles);
    this.handleEdibleCollisions(collisions, timers, galaxy);
    this.handleProjectileCollisions(projectiles, timers, galaxy);
  }

  updateFrankFuel(keys) {
    if (!keys["w"]) return;
    let newFuel = this.fuel - this.getFuelConsumption();
    if (newFuel < 0) this.fuel = 0;
    else this.fuel = newFuel;
  }

  handleProjectileCollisions(projectiles, timers) {
    for (const projectile of projectiles) {
      this.fuel -= projectile.damage;
      timers.damagedTimer = DAMAGE_TIMER_MAX;
      projectile.dead = true;
    }
  }

  detectCollisions(objects) {
    const collisions = [];

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

  handleEdibleCollisions(objects, timers) {
    const maxEdibleRadius = this.radius * 0.75;

    for (const obj of objects) {
      const isEdible = obj.radius <= maxEdibleRadius;

      if (isEdible) {
        obj.dead = true;
        this.eatEntity(obj);
        this.playEatSound();
      } else {
        this.handleCrash(obj, timers);
      }
    }
  }

  handleCrash(obj, timers) {
    const dx = this.x + this.vx - obj.x;
    const dy = this.y + this.vy - obj.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;

    const normalVelocity = this.vx * nx + this.vy * ny;
    const impactSpeed = Math.abs(normalVelocity);
    const impactThreshold = 1.5;
    const fuelLossMultiplier = 10;

    if (impactSpeed > impactThreshold) {
      this.fuel = Math.max(0, this.fuel - impactSpeed * fuelLossMultiplier);
      timers.damagedTimer = DAMAGE_TIMER_MAX;
      this.playDmgSound();
    }
    if (normalVelocity < 0) {
      this.vx -= normalVelocity * nx;
      this.vy -= normalVelocity * ny;
    }
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
