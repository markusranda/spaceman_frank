import { Enemy, MAX_ATTACK_TIMER } from "../enemy";
import { Planet } from "../planet/planet";
import { SPAWN_TIMER_MAX } from "../timers";
import { Projectile } from "../projectile";
import { SpaceCamera } from "../models/space_camera";
import { Frank } from "../frank/frank";
import { SpaceTimers } from "../space_timers";
import { Container, ObservablePoint } from "pixi.js";
import { UniversePlanetSpawner } from "./universe_planet_spawner";
import { SpaceItem } from "../items/space_item";
import { getDistance } from "../coords";

export class Universe {
  planets: Planet[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  items: SpaceItem[] = [];
  enemyMaxCount = 10;
  currentEvolution = 1;
  planetSpacing = 125;
  camera: SpaceCamera | null = null;
  planetSpawner = new UniversePlanetSpawner();
  radius = 0;

  constructor(camera: SpaceCamera) {
    if (!camera) throw Error("Can't create universe without camera");
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
    this.updateItems();
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

  updateItems() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.aquired) {
        this.items.splice(i, 1);
        item.destroy();
      }
    }
  }

  spawnNextPlanetBelt(frank: Frank, container: Container, firstSpawn: boolean) {
    const planets = this.planetSpawner.getNextPlanets(
      this.currentEvolution,
      frank,
      firstSpawn
    );

    // Update container
    for (const planet of planets) {
      planet.addTo(container);
    }

    // Update state
    this.planets.push(...planets);

    this.radius = this.planets.reduce((max: number, planet: Planet) => {
      const dist = getDistance(planet.x, planet.y, 0, 0);
      if (dist > max) max = dist;

      return max;
    }, this.radius);
  }

  addItem(item: SpaceItem) {
    this.items.push(item);
  }
}
