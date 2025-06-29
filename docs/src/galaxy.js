import { frank } from "../index.js";
import { Planet } from "./planet.js";

export class Galaxy {
  planets = [];
  enemies = [];
  projectiles = [];
  enemyMaxCount = 10;
  currentEvolution = 1;
  planetSpacing = 125;
  stepSize = 25;

  constructor() {}

  spawnNextPlanetBelt(frank) {
    const centerX = 0;
    const centerY = 0;

    const basePlanetSize = frank.radius * 4;
    const donutSpacing = basePlanetSize * 3;

    const innerRadius = this.currentEvolution * donutSpacing + basePlanetSize;
    const outerRadius = innerRadius + donutSpacing;

    const estimatedPlanetArea = this.estimateAveragePlanetAreaForBelt();
    const beltArea = Math.PI * (outerRadius ** 2 - innerRadius ** 2);
    const densityFactor = 1.8;
    const maxPlanets = Math.floor(
      beltArea / (estimatedPlanetArea * densityFactor)
    );
    const maxAttempts = maxPlanets * 10;

    let attempts = 0;
    let placed = 0;

    while (attempts < maxAttempts && placed < maxPlanets) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const planetX = centerX + Math.cos(angle) * radius;
      const planetY = centerY + Math.sin(angle) * radius;

      const planetRadius = this.getRandomPlanetRadiusForBelt();

      const candidate = new Planet(planetX, planetY, planetRadius);

      if (!this.doesBeltPlanetCollide(candidate, this.planets)) {
        this.planets.push(candidate);
        placed++;
      }

      attempts++;
    }
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

  getRandomPlanetRadiusForBelt() {
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

  estimateAveragePlanetAreaForBelt() {
    const sampleCount = 100;
    let totalArea = 0;

    for (let i = 0; i < sampleCount; i++) {
      const radius = this.getRandomPlanetRadiusForBelt();
      const totalRadius = radius + this.planetSpacing;
      const area = Math.PI * totalRadius * totalRadius;
      totalArea += area;
    }

    return totalArea / sampleCount;
  }
}
