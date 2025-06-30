import { Enemy, MAX_ATTACK_TIMER } from "./enemy.js";
import { Planet } from "./planet.js";
import { SPAWN_TIMER_MAX } from "./timers.js";
import { Projectile } from "./projectile.js";

export class Galaxy {
  planets = [];
  enemies = [];
  projectiles = [];
  enemyMaxCount = 10;
  currentEvolution = 1;
  planetSpacing = 125;
  stepSize = 25;

  constructor() {}

  update(delta, frank, timers, container) {
    this.updateSpawnEnemies(frank, timers, container);
    this.updateEnemies(delta, frank, container);
    this.updateProjectiles(delta);
    this.updatePlanets();
  }

  updateSpawnEnemies(frank, timers, container) {
    if (timers.spawnTimer <= 0 && this.enemies.length < this.enemyMaxCount) {
      try {
        const enemy = new Enemy(frank, this);
        this.enemies.push(enemy);
        container.addChild(enemy.sprite);
      } catch (e) {
        console.error(e);
      } finally {
        timers.spawnTimer = SPAWN_TIMER_MAX;
      }
    }
  }

  updateEnemies(delta, frank, container) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.dead) {
        this.enemies.splice(i, 1);
        enemy.destroy();
        continue;
      }

      const dist = this.moveEnemy(frank, enemy);
      if (enemy.attackTimer <= 0 && enemy.attackRange >= dist) {
        const angle = Math.atan2(frank.y - enemy.y, frank.x - enemy.x);
        const projectile = new Projectile(enemy.x, enemy.y, angle);
        this.projectiles.push(projectile);
        projectile.sprite = container.addChild(projectile.sprite);
        enemy.attackTimer = MAX_ATTACK_TIMER;
      }

      enemy.attackTimer -= delta;
    }
  }

  moveEnemy(frank, enemy) {
    const sweetSpot = 400;
    const dx = frank.x - enemy.x;
    const dy = frank.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return dist;

    // Move toward or away from Frank to reach the sweet spot
    let moveDir = 0;
    if (dist > sweetSpot + 10) moveDir = 1; // too far, move closer
    else if (dist < sweetSpot - 10) moveDir = -1; // too close, back off
    // else: stay put

    const stepX = (dx / dist) * enemy.speed * moveDir;
    const stepY = (dy / dist) * enemy.speed * moveDir;

    const x = enemy.x + stepX;
    const y = enemy.y + stepY;
    enemy.setPosition(x, y);

    return dist;
  }

  updateProjectiles(delta) {
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
    }
  }

  spawnNextPlanetBelt(frank) {
    const centerX = 0;
    const centerY = 0;

    const basePlanetSize = frank.radius * 4;
    const donutSpacing = basePlanetSize * 3;

    const innerRadius = this.currentEvolution * donutSpacing + basePlanetSize;
    const outerRadius = innerRadius + donutSpacing;

    const estimatedPlanetArea = this.estimateAveragePlanetAreaForBelt(frank);
    const beltArea = Math.PI * (outerRadius ** 2 - innerRadius ** 2);
    const densityFactor = 1.8;
    const maxPlanets = Math.floor(
      beltArea / (estimatedPlanetArea * densityFactor)
    );
    const maxAttempts = maxPlanets * 10;

    let attempts = 0;
    let placed = 0;

    const newPlanets = [];
    while (attempts < maxAttempts && placed < maxPlanets) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const planetX = centerX + Math.cos(angle) * radius;
      const planetY = centerY + Math.sin(angle) * radius;

      const planetRadius = this.getRandomPlanetRadiusForBelt(frank);

      const candidate = new Planet(planetX, planetY, planetRadius);

      if (!this.doesBeltPlanetCollide(candidate, this.planets)) {
        this.planets.push(candidate);
        newPlanets.push(candidate);
        placed++;
      }

      attempts++;
    }

    return newPlanets;
  }

  doesBeltPlanetCollide(p, planets) {
    for (const planet of planets) {
      const dx = p.x - planet.x;
      const dy = p.y - planet.y;
      const dist = Math.hypot(dx, dy);
      const minDist = p.radius + planet.radius + this.planetSpacing;

      if (dist < minDist) return true;
    }
    return false;
  }

  getRandomPlanetRadiusForBelt(frank) {
    const frankRadius =
      frank.baseFrankRadius + this.currentEvolution === 1
        ? 0
        : this.currentEvolution * this.stepSize;

    const maxEdible = frankRadius * 0.75;
    const minEdible = frankRadius * 0.5;

    const rand = Math.random();

    if (rand < 0.2) {
      // Small
      return this.randomStepMultiple(
        minEdible * 0.25,
        minEdible,
        this.stepSize
      );
    } else if (rand < 0.7) {
      // Ideal
      return this.randomStepMultiple(minEdible, maxEdible, this.stepSize);
    } else {
      // Too big
      return this.randomStepMultiple(
        maxEdible + this.stepSize,
        maxEdible + 3 * this.stepSize,
        this.stepSize
      );
    }
  }

  randomStepMultiple(min, max) {
    const minSteps = Math.ceil(min / this.stepSize);
    const maxSteps = Math.floor(max / this.stepSize);
    const chosenSteps = this.randomIntInRange(minSteps, maxSteps);
    return chosenSteps * this.stepSize;
  }

  randomIntInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  estimateAveragePlanetAreaForBelt(frank) {
    const sampleCount = 100;
    let totalArea = 0;

    for (let i = 0; i < sampleCount; i++) {
      const radius = this.getRandomPlanetRadiusForBelt(frank);
      const totalRadius = radius + this.planetSpacing;
      const area = Math.PI * totalRadius * totalRadius;
      totalArea += area;
    }

    return totalArea / sampleCount;
  }
}
