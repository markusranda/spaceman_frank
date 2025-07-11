import { Frank } from "../frank/frank";
import { TreasurePlanet } from "../planet/treasure_planet";
import { Planet } from "../planet/planet";

export class UniversePlanetSpawner {
  constructor() {}

  getNextPlanets(currentEvolution: number, frank: Frank) {
    const planets = [];
    const centerX = 0;
    const centerY = 0;

    const basePlanetSize = frank.radius * 4;
    const donutSpacing = basePlanetSize * 3;

    const innerRadius = currentEvolution * donutSpacing + basePlanetSize;
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
    planets.push(treasurePlanet);

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
      planets.push(planet);
    }

    return planets;
  }

  shortestAngleDiff(a: number, b: number): number {
    return ((a - b + Math.PI * 3) % (2 * Math.PI)) - Math.PI;
  }
}
