import { Enemy, MAX_ATTACK_TIMER } from "./enemy";
import { Planet } from "./planet/planet";
import { SPAWN_TIMER_MAX } from "./timers";
import { Projectile } from "./projectile";
import { SpaceCamera } from "./models/space_camera";
import { Frank } from "./frank/frank";
import { SpaceTimers } from "./space_timers";
import { Container, ObservablePoint } from "pixi.js";
import { TreasurePlanet } from "./planet/treasure_planet";

export class Galaxy {
  planets: Planet[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  enemyMaxCount = 10;
  currentEvolution = 1;
  planetSpacing = 125;
  camera: SpaceCamera | null = null;

  constructor(camera: SpaceCamera) {
    if (!camera) throw Error("Can't create galaxy without camera");
    this.camera = camera;
  }

  update(
    delta: number,
    frank: Frank,
    timers: SpaceTimers,
    container: Container,
    cameraScale: ObservablePoint
  ) {
    this.updateSpawnEnemies(timers, container, frank);
    this.updateEnemies(delta, frank, container, cameraScale);
    this.updateProjectiles(delta);
    this.updatePlanets();
  }

  updateSpawnEnemies(timers: SpaceTimers, container: Container, frank: Frank) {
    if (timers.spawnTimer <= 0 && this.enemies.length < this.enemyMaxCount) {
      const enemy = new Enemy(this, frank);
      this.enemies.push(enemy);
      enemy.addTo(container);
      timers.spawnTimer = SPAWN_TIMER_MAX;
    }
  }

  updateEnemies(
    delta: number,
    frank: Frank,
    container: Container,
    cameraScale: ObservablePoint
  ) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.dead) {
        this.enemies.splice(i, 1);
        enemy.destroy();
        continue;
      }

      const dist = this.moveEnemy(frank, enemy, cameraScale, delta);
      const attackRange = (enemy.attackRange * 1) / cameraScale.x;
      if (enemy.attackTimer <= 0 && attackRange >= dist) {
        const angle = Math.atan2(frank.y - enemy.y, frank.x - enemy.x);
        const projectile = new Projectile(
          enemy.x + enemy.radius / 2,
          enemy.y + enemy.radius / 2,
          angle,
          enemy.radius / 10
        );
        this.projectiles.push(projectile);
        container.addChild(projectile.sprite);
        enemy.attackTimer = MAX_ATTACK_TIMER;
      }

      enemy.attackTimer -= delta;
    }
  }

  moveEnemy(
    frank: Frank,
    enemy: Enemy,
    cameraScale: ObservablePoint,
    deltaMS: number
  ) {
    const dt = deltaMS / 1000;
    const sweetSpot = 500 / cameraScale.x;

    const dx = frank.x - enemy.x;
    const dy = frank.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return dist;

    const dirX = dx / dist;
    const dirY = dy / dist;

    // Determine if chasing or retreating
    const moveDir = dist > sweetSpot ? 1 : -1;

    // Accelerate in that direction
    enemy.vx += dirX * enemy.acceleration * moveDir * dt;
    enemy.vy += dirY * enemy.acceleration * moveDir * dt;

    // Clamp speed
    const speed = Math.hypot(enemy.vx, enemy.vy);
    if (speed > enemy.maxSpeed) {
      const scale = enemy.maxSpeed / speed;
      enemy.vx *= scale;
      enemy.vy *= scale;
    }

    // Move enemy
    const x = enemy.x + enemy.vx * dt;
    const y = enemy.y + enemy.vy * dt;
    enemy.setPosition(x, y);

    return dist;
  }

  updateProjectiles(delta: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.ttl -= delta;
      if (projectile.ttl <= 0 || projectile.dead) {
        this.projectiles.splice(i, 1);
        projectile.destroy();
        continue;
      }

      const speed = projectile.speed;
      const x = projectile.x + Math.cos(projectile.angle) * speed;
      const y = projectile.y + Math.sin(projectile.angle) * speed;
      projectile.setPosition(x, y);
    }
  }

  updatePlanets() {
    for (let i = this.planets.length - 1; i >= 0; i--) {
      const planet = this.planets[i];
      if (planet.dead) {
        this.planets.splice(i, 1);
        planet.destroy();
      }

      planet.update();
    }
  }

  spawnNextPlanetBelt(frank: Frank, container: Container) {
    const centerX = 0;
    const centerY = 0;

    const basePlanetSize = frank.radius * 4;
    const donutSpacing = basePlanetSize * 3;

    const innerRadius = this.currentEvolution * donutSpacing + basePlanetSize;
    const treasureRadius = frank.radius * 8;

    const treasureAngle = Math.random() * 2 * Math.PI;
    const treasureDist = innerRadius + Math.random() * donutSpacing;
    const treasureX = centerX + Math.cos(treasureAngle) * treasureDist;
    const treasureY = centerY + Math.sin(treasureAngle) * treasureDist;

    const treasurePlanet = new TreasurePlanet(
      treasureX,
      treasureY,
      treasureRadius
    );
    this.planets.push(treasurePlanet);
    treasurePlanet.addTo(container);

    const planetCount = 20;
    const angleStep = (2 * Math.PI) / planetCount;

    // How much angle should we "blacklist" around the treasure planet?
    const angleBuffer = Math.asin((treasureRadius * 2) / treasureDist); // total angular width

    const angleOffset = Math.random() * 2 * Math.PI;

    for (let i = 0; i < planetCount; i++) {
      const angle = angleOffset + i * angleStep;

      // Check if this angle overlaps with the treasure planet's zone
      const angleDiff = this.shortestAngleDiff(angle, treasureAngle);
      if (Math.abs(angleDiff) < angleBuffer) {
        continue; // Skip to avoid overlap
      }

      const dist = innerRadius + Math.random() * donutSpacing;
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;

      const multiplier =
        Math.random() < 0.5
          ? 0.5 + Math.random() * 0.25
          : 0.75 + Math.random() * 0.25;
      const radius = frank.radius * multiplier;

      const planet = new Planet(x, y, radius);
      this.planets.push(planet);
      planet.addTo(container);
    }
  }

  shortestAngleDiff(a: number, b: number): number {
    return ((a - b + Math.PI * 3) % (2 * Math.PI)) - Math.PI;
  }
}
