import { Planet } from "./planet.js";

export class Galaxy {
  planets = [];
  evolutions = 1;
  planetSpacing = 125;

  constructor() {}

  spawnNextPlanetBelt(frank) {
    const centerX = 0;
    const centerY = 0;

    const basePlanetSize = frank.radius * 4;
    const sizeStep = 50;
    const donutSpacing = basePlanetSize * 3;
    const belt = this.evolutions;

    const innerRadius = belt * donutSpacing + basePlanetSize;
    const outerRadius = innerRadius + donutSpacing;

    const avgPlanetRadius = sizeStep * 2.5; // weighted guess
    const planetArea =
      Math.PI * Math.pow(avgPlanetRadius + this.planetSpacing, 2);
    const beltArea = Math.PI * (outerRadius ** 2 - innerRadius ** 2);
    const densityFactor = 1.8;

    const maxPlanets = Math.floor(beltArea / (planetArea * densityFactor));
    const maxAttempts = maxPlanets * 10;

    let attempts = 0;
    let placed = 0;

    while (attempts < maxAttempts && placed < maxPlanets) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const planetX = centerX + Math.cos(angle) * radius;
      const planetY = centerY + Math.sin(angle) * radius;

      const planetSizeSteps = Math.floor(Math.random() * 4) + 1;
      const planetRadius = sizeStep * planetSizeSteps;

      const candidate = new Planet(planetX, planetY, planetRadius);

      if (!this.doesBeltPlanetCollide(candidate, this.planets)) {
        this.planets.push(candidate);
        placed++;
      }

      attempts++;
    }

    console.log(
      `Belt ${belt} placed ${placed} / ${maxPlanets} planets after ${attempts} attempts`
    );

    this.evolutions++;
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
}
