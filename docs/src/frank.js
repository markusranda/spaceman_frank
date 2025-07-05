import { sprites } from "./sprites.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";
import {
  DAMAGE_TIMER_MAX,
  FRANK_CHARGE_COOLDOWN_TIMEOUT,
  FRANK_CHARGE_TIMER_MAX,
  FRANK_MULTI_HEAD_TIMEOUT,
} from "./timers.js";
import { audios } from "./audio.js";
import { FRANK_STATE } from "./frankstate.js";

export class Frank {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  angle = (3 * Math.PI) / 2;
  baseAcceleration = 500;
  chargeAcceleration = 1500;
  acceleration = this.baseAcceleration;
  rotationSpeed = 0.08;
  baseMaxSpeed = 750;
  chargeMaxSpeed = 3000;
  maxSpeed = this.baseMaxSpeed;
  friction = 0.9945;

  container = undefined;
  frankSprite = undefined;
  flameSprite = undefined;
  radius = 0;
  maxFuel = 5000;
  fuel = this.maxFuel;
  fuelConsumption = 0.5;
  upgrades = {};
  baseRadius = 50;
  fullness = 0;
  level = 0;
  lastDmgAudioIndex = 0;
  lastEatAudioIndex = 0;
  state = FRANK_STATE.NORMAL;
  chargeTimer = 0;

  constructor() {
    const texture = sprites["frank"];
    this.container = new PIXI.Container();
    this.container.name = "frank_container";
    this.frankSprite = new PIXI.Sprite(texture);
    this.frankSprite.name = "frank_sprite";
    this.flameSprite = new PIXI.Graphics();
    this.frankSprite.name = "frank_thruster";
    this.frankSprite.anchor.set(0.5);
    this.radius = this.baseRadius;
    this.x = 0;
    this.y = 0;
    this.chargingAudioObj = audios["charging"];
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

  update(delta, keys, galaxy, timers, containers) {
    this.updateCharging(keys, delta, timers);
    this.updateFrankFuel(keys);
    this.updateFrankMovement(delta, keys, galaxy, timers);
    this.updateThrusterAudio(keys);
    this.updateSpawnAfterimage(containers, timers);
  }

  updateCharging(keys, delta, timers) {
    const boostBtnPressed = keys[" "];
    const { audio, gainNode, audioCtx } = this.chargingAudioObj;

    // === CHARGING: Frank is flying like a damn torpedo ===
    if (this.state === FRANK_STATE.CHARGING) {
      if (this.chargeTimer > 0) {
        this.chargeTimer = Math.min(
          FRANK_CHARGE_TIMER_MAX,
          this.chargeTimer - delta
        );
      } else {
        this.enterState(FRANK_STATE.NORMAL);
        this.acceleration = this.baseAcceleration;
        this.maxSpeed = this.baseMaxSpeed;
      }
      return;
    }

    // === PRE_CHARGING: Charging up ===
    if (this.state === FRANK_STATE.PRE_CHARGING) {
      // Continue charging
      this.chargeTimer = Math.min(
        FRANK_CHARGE_TIMER_MAX,
        this.chargeTimer + delta
      );

      const fullyCharged = this.chargeTimer >= FRANK_CHARGE_TIMER_MAX;

      // === Handle tail replay ===
      if (fullyCharged && boostBtnPressed) {
        const now = performance.now();
        this._lastTailReplay = this._lastTailReplay || 0;

        if (now - this._lastTailReplay > 200) {
          // every 200ms
          this._lastTailReplay = now;
          // Replay the tail
          audio.currentTime = audio.duration * 0.9;
          audio.play();
        }
      }

      // Fully charged and still holding? Fire!
      if (!boostBtnPressed && fullyCharged) {
        this.enterState(FRANK_STATE.CHARGING);
        this.acceleration = this.chargeAcceleration;
        this.maxSpeed = this.chargeMaxSpeed;

        const dirX = Math.cos(this.angle);
        const dirY = Math.sin(this.angle);
        this.vx = dirX * this.chargeMaxSpeed;
        this.vy = dirY * this.chargeMaxSpeed;

        timers.chargeCooldownTimer = FRANK_CHARGE_COOLDOWN_TIMEOUT;
      } else if (!boostBtnPressed) {
        // Cancel charge if player lets go early
        this.enterState(FRANK_STATE.NORMAL);
        this.chargeTimer = 0;
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05); // fade out
        return;
      }

      return;
    }

    // === NORMAL: Check if we should start charging ===
    if (boostBtnPressed && timers.chargeCooldownTimer <= 0) {
      this.enterState(FRANK_STATE.PRE_CHARGING);
      this.chargeTimer = Math.min(
        FRANK_CHARGE_TIMER_MAX,
        this.chargeTimer + delta
      );

      // Start audio
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.05);
      audio.currentTime = 0;
      audio.play();

      return;
    }
  }

  enterState(newState) {
    if (this.state !== newState) {
      console.log(`STATE: ${this.state} → ${newState}`);
      this.state = newState;
    }
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

  evolve() {
    this.level++;
    this.fullness = 0;
    this.fuel = this.maxFuel;

    const b = 147; // switch level
    const a = 205; // base radius after soft cap

    if (this.level < b) {
      this.radius = 50 + 35 * Math.log(this.level + 1); // early growth
    } else {
      this.radius = a + 4 * Math.log(this.level + 1); // soft-capped curve
    }

    console.log(`Level ${this.level} → Radius: ${this.radius.toFixed(2)}`);
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

  updateFrankMovement(delta, keys, galaxy, timers) {
    const dt = delta / 1000;
    const hasFuel = this.fuel > 0;

    // === ROTATION ===
    if (keys.a) this.angle -= this.rotationSpeed;
    if (keys.d) this.angle += this.rotationSpeed;

    // === THRUST ===
    if (hasFuel && keys.w) {
      const accel = this.getAcceleration();
      this.vx += Math.cos(this.angle) * accel * dt;
      this.vy += Math.sin(this.angle) * accel * dt;
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
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // === COLLISIONS ===
    const collisions = [];
    collisions.push(...this.detectCollisions(galaxy.planets));
    collisions.push(...this.detectCollisions(galaxy.enemies));
    const projectiles = this.detectCollisions(galaxy.projectiles);
    this.handleEdibleCollisions(collisions, timers, dt);
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
      timers.damageTimer = DAMAGE_TIMER_MAX;
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

  handleEdibleCollisions(objects, timers, dt) {
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

  handleCrash(obj, timers, dt) {
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
      const fuelLoss = this.maxFuel / 16;
      this.fuel = Math.max(0, this.fuel - fuelLoss);
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

    // Optional: apply immediate position change based on new velocity (1 frame’s worth)
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

  updateSpawnAfterimage(container, timers) {
    if (this.state === FRANK_STATE.CHARGING) {
      if (timers.multiheadTimer <= 0) {
        const afterimage = new PIXI.Sprite(this.frankSprite.texture);

        // Copy transform properties
        afterimage.x = this.x;
        afterimage.y = this.y;
        afterimage.rotation = this.container.rotation;
        afterimage.anchor.set(
          this.frankSprite.anchor.x,
          this.frankSprite.anchor.y
        );
        afterimage.scale.set(
          this.frankSprite.scale.x,
          this.frankSprite.scale.y
        );

        // Visuals
        afterimage.alpha = 0.3;

        // Optional: tint to give a ghostly or energy effect
        afterimage.tint = 0x88ccff;

        container.addChild(afterimage);

        // Fade and remove
        const fadeTime = 300; // ms
        const fadeSteps = 10;
        let step = 0;

        const fadeInterval = setInterval(() => {
          step++;
          afterimage.alpha -= 0.3 / fadeSteps;
          if (step >= fadeSteps) {
            clearInterval(fadeInterval);
            container.removeChild(afterimage);
          }
        }, fadeTime / fadeSteps);

        // Reset timer
        timers.multiheadTimer = FRANK_MULTI_HEAD_TIMEOUT;
      }
    }
  }
}
