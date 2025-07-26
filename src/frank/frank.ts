import { sprites } from "../sprites/sprites";
import { Container, Sprite } from "pixi.js";
import { DAMAGE_TIMER_MAX } from "../timers";
import { audios } from "../audio";
import {
  FRANK_ACCELERATION_BASE,
  FRANK_ACCELERATION_CHARGING,
  FRANK_MAX_SPEED_BASE,
  FRANK_MAX_SPEED_CHARGING,
  FRANK_STATE,
} from "./const";
import { Universe } from "../universe/universe";
import { SpaceTimers } from "../space_timers";
import { Entity } from "../entity";
import { Projectile } from "../projectile";
import { FrankJetpack, JetpackMode } from "./jetpack";
import { FrankCharger } from "./charger";
import { SpaceItem } from "../items/space_item";
import { detectEntityCollisions } from "../collisions";
import { GAME_STATES } from "../gamestate";
import { GameStats } from "../game_stats";
import { Enemy } from "../enemy";
import { Planet } from "../planet/planet";

export class Frank {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  angle = (3 * Math.PI) / 2;
  baseAcceleration = FRANK_ACCELERATION_BASE;
  acceleration = this.baseAcceleration;
  rotationSpeed = 5;
  baseMaxSpeed = FRANK_MAX_SPEED_BASE;
  maxSpeed = this.baseMaxSpeed;
  friction = 0.9945;

  container = new Container();
  shakeWrapper = new Container();
  frankSprite = new Sprite();
  radius = 0;
  baseRadius = 50;
  fullness = 0;
  level = 0;
  lastDmgAudioIndex = 0;
  lastEatAudioIndex = 0;
  state = FRANK_STATE.normal;
  gameStats: GameStats;
  jetpack: FrankJetpack | null = null;
  charger: FrankCharger | null = null;
  items: Record<string, SpaceItem> = {};

  // Audio
  impactAudio = audios["kick"];
  audioListDmg = [audios["damage_1"], audios["damage_2"]];
  audioListEat = [
    audios["eat_1"],
    audios["eat_2"],
    audios["eat_3"],
    audios["eat_4"],
    audios["eat_5"],
    audios["eat_6"],
  ];

  constructor(cameraContainer: Container, gameStats: GameStats) {
    this.gameStats = gameStats;
    this.container.label = "frank_container";
    this.frankSprite.texture = sprites["frank"]?.texture;
    this.frankSprite.label = "frank_sprite";
    this.frankSprite.anchor.set(0.5);
    this.radius = this.baseRadius;
    this.x = 0;
    this.y = 0;

    const getItems = this.getItems.bind(this);
    this.jetpack = new FrankJetpack(cameraContainer, getItems);
    this.charger = new FrankCharger(getItems);
  }

  getAcceleration(): number {
    let value = this.baseAcceleration;
    if (this.state === FRANK_STATE.charging)
      value = FRANK_ACCELERATION_CHARGING;
    for (const item of Object.values(this.getItems())) {
      value = item.modifyAcceleration(value);
    }
    return value;
  }

  getMaxSpeed(): number {
    let value = this.baseMaxSpeed;
    if (this.state === FRANK_STATE.charging) value = FRANK_MAX_SPEED_CHARGING;

    for (const item of Object.values(this.getItems())) {
      value = item.modifyMaxSpeed(value);
    }
    return value;
  }

  getItems() {
    return this.items;
  }

  getFullnessGoal() {
    return 10;
  }

  setVelocity(speed: number) {
    const dirX = Math.cos(this.angle);
    const dirY = Math.sin(this.angle);
    this.vx = dirX * speed;
    this.vy = dirY * speed;
  }

  update(
    delta: number,
    keys: Record<string, boolean>,
    universe: Universe,
    timers: SpaceTimers,
    container: Container,
    gameState: string
  ) {
    if (!this.jetpack) throw Error("Can't update Frank without Jetpack");

    switch (this.state) {
      case FRANK_STATE.normal:
        this.jetpack.setMode(JetpackMode.Normal);
        if (keys["w"]) this.jetpack.setThrusting(true);
        else this.jetpack.setThrusting(false);
        break;
      case FRANK_STATE.preCharging:
        this.jetpack.setMode(JetpackMode.Normal);
        if (keys["w"]) this.jetpack.setThrusting(true);
        else this.jetpack.setThrusting(false);
        break;
      case FRANK_STATE.charging:
        this.jetpack.setMode(JetpackMode.TotalOverdrive);
        this.jetpack.setThrusting(true);
        break;
      default:
        console.error(`Unknown state: ${this.state}`);
    }

    this.updateCommon(keys, delta, universe, timers, container, gameState);
  }

  updateCommon(
    keys: Record<string, boolean>,
    delta: number,
    universe: Universe,
    timers: SpaceTimers,
    container: Container,
    gameState: string
  ) {
    if (gameState !== GAME_STATES.end) {
      this.charger?.update(
        delta,
        keys,
        this.state,
        this.frankSprite,
        container,
        this.x,
        this.y,
        this.angle,
        this.enterState.bind(this),
        this.setVelocity.bind(this)
      );
    }
    this.updateFrankMovement(delta, keys, universe, timers, gameState);
    this.shakeChargeEffect();
    this.updateVisuals();
    this.jetpack?.update(this.radius, this.x, this.y);

    this.updateItems(universe, delta, container);
  }

  updateItems(universe: Universe, delta: number, container: Container) {
    for (const item of Object.values(this.getItems())) {
      item?.update(this, universe, delta, container);
    }
  }

  enterState(newState: string) {
    if (this.state !== newState) {
      this.state = newState;
    }
  }

  eatEntity(entity: Entity) {
    if (!entity.radius)
      throw Error(`Can't eat something without radius: ${entity}`);
    const minEdible = this.radius * 0.5;

    if (entity.radius >= minEdible) {
      this.fullness += 1.0;
    } else {
      const levelDiff = Math.floor(Math.log2(this.radius / entity.radius));
      this.fullness += 1.0 / 2 ** levelDiff;
    }

    entity.dead = true;
    this.playEatSound();

    // Update game stats
    if (entity instanceof Enemy) this.gameStats.enemiesEaten++;
    if (entity instanceof Planet) this.gameStats.planetsEaten++;
  }

  evolve() {
    this.level++;
    this.fullness = 0;
    this.jetpack?.resetFuel();

    const b = 147; // switch level
    const a = 205; // base radius after soft cap

    if (this.level < b) {
      this.radius = 50 + 35 * Math.log(this.level + 1); // early growth
    } else {
      this.radius = a + 4 * Math.log(this.level + 1); // soft-capped curve
    }

    // Update game stats
    this.gameStats.frankSize = this.radius;
  }

  shakeChargeEffect() {
    if (!this.charger) throw Error("Can't shake without my charger");
    const intensity =
      this.charger.chargeUpTimer / this.charger.getChargeUpDuration(); // Scale with timer (assuming timer max is ~1000ms)
    const maxShake = 8; // pixels
    const shakeAmount = Math.min(maxShake, intensity * maxShake);

    const angle = Math.random() * Math.PI * 2;
    const offsetX = Math.cos(angle) * shakeAmount;
    const offsetY = Math.sin(angle) * shakeAmount;

    this.shakeWrapper.x = offsetX;
    this.shakeWrapper.y = offsetY;
  }

  addTo(container: Container) {
    if (!this.jetpack) throw Error("Can't addTo without defined jetpack");
    this.shakeWrapper.addChild(this.frankSprite);
    this.shakeWrapper.addChild(this.jetpack.flameGraphics);
    this.frankSprite.anchor.set(0.5);

    this.container.addChild(this.shakeWrapper);

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
    universe: Universe,
    timers: SpaceTimers,
    gameState: string
  ) {
    const dt = delta / 1000;
    const hasFuel = this.jetpack?.hasFuel() ?? 0;

    // No new movement if game is over
    let isThrusting = false;
    if (gameState !== GAME_STATES.end) {
      // === ROTATION ===
      if (keys.a) this.angle -= this.rotationSpeed * dt;
      if (keys.d) this.angle += this.rotationSpeed * dt;

      // === THRUST CHECK ===
      isThrusting = this.jetpack?.thrusting ?? false;
    }

    // === THRUST ===
    if (hasFuel && isThrusting) {
      this.vx += Math.cos(this.angle) * this.getAcceleration() * dt;
      this.vy += Math.sin(this.angle) * this.getAcceleration() * dt;
    }

    // === Clamp speed ===
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.getMaxSpeed()) {
      const scale = this.getMaxSpeed() / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

    // === MOVE ===
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.handleCollisions(universe, timers, dt);
  }

  handleCollisions(universe: Universe, timers: SpaceTimers, dt: number) {
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
    this.handleEntityCrashes(collisions, timers, dt);
    this.handleProjectileCollisions(projectiles, timers);
    this.handleItemCollisions(universe);
  }

  handleItemCollisions(universe: Universe) {
    const collisions = detectEntityCollisions(
      universe.items,
      this.x,
      this.y,
      this.radius
    );
    for (const item of collisions) {
      item.aquired = true;
      if (!this.items[item.id]) this.items[item.id] = item;
      else this.items[item.id].level++;
    }

    // Update game stats
    this.gameStats.frankItems = this.items;
  }

  handleProjectileCollisions(projectiles: Projectile[], timers: SpaceTimers) {
    for (const projectile of projectiles) {
      this.jetpack?.damageFuelTank(projectile.damage);
      timers.damageTimer = DAMAGE_TIMER_MAX;
      projectile.dead = true;
    }
  }

  handleEntityCrashes(entities: Entity[], timers: SpaceTimers, dt: number) {
    const maxEdibleRadius = this.radius * 0.75;

    for (const entity of entities) {
      const isEdible = entity.radius <= maxEdibleRadius;

      if (isEdible) {
        this.eatEntity(entity);
      } else if (this.state === FRANK_STATE.charging) {
        this.handleDamageEntity(entity, timers, dt);
      } else {
        this.handleCrash(entity, timers, dt, false);
      }
    }
  }

  handleDamageEntity(entity: Entity, timers: SpaceTimers, dt: number) {
    const dmg = this.calculateDamage(entity);
    entity.health = Math.max(0, entity.health - dmg);

    // Handle lifecyle of entity
    if (entity.health <= 0) {
      this.eatEntity(entity);
    } else {
      // Go crash
      this.handleCrash(entity, timers, dt, true);
    }
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

  handleCrash(
    entity: Entity,
    timers: SpaceTimers,
    dt: number,
    invulnerable: boolean
  ) {
    // Vector from entity to Frank
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    // Unit direction away from object
    const nx = dx / dist;
    const ny = dy / dist;

    // === Damage check BEFORE we overwrite velocity ===
    const relativeVx = this.vx;
    const relativeVy = this.vy;
    const impactSpeed = Math.abs(relativeVx * nx + relativeVy * ny);
    const damageThreshold = this.getMaxSpeed() * 0.5;

    if (!invulnerable && impactSpeed > damageThreshold) {
      const maxFuel = this.jetpack?.getMaxFuel() ?? 0;
      const fuelLoss = maxFuel / 16;
      this.jetpack?.damageFuelTank(fuelLoss);
      timers.damageTimer = DAMAGE_TIMER_MAX;
      this.playDmgSound();
    } else {
      this.playImpactSound();
    }

    // === Apply knockback velocity ===
    this.vx = nx * impactSpeed;
    this.vy = ny * impactSpeed;

    // === Push out of the object (prevent overlap) ===
    const totalRadius = this.radius + entity.radius;
    const overlap = totalRadius - dist;
    if (overlap > 0) {
      this.x += nx * overlap;
      this.y += ny * overlap;
    }

    // ✅ One-frame knockback motion
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  playImpactSound() {
    const { audio, gainNode, audioCtx } = this.impactAudio;
    gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.05);
    audio.play();
  }

  playDmgSound() {
    const index = (this.lastEatAudioIndex + 1) % this.audioListDmg.length;
    const { audio, gainNode, audioCtx } = this.audioListDmg[index];
    gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.05);
    audio.play();
    this.lastDmgAudioIndex = index;
  }

  playEatSound() {
    const index = (this.lastEatAudioIndex + 1) % this.audioListEat.length;
    const { audio, gainNode, audioCtx } = this.audioListEat[index];
    gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.05);
    audio.play();
    this.lastEatAudioIndex = index;
  }
}
