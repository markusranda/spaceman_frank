export class Planet {
  radius = 0;
  x = 0;
  y = 0;
  color = "grey";

  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

export function createPlanet(worldX, worldY, objects) {
  const x = Math.round(Math.random() * worldX);
  const y = Math.round(Math.random() * worldY);
  const radius = randomBetween(50, 90);

  const planet = new Planet(x, y, radius);
  for (const obj of objects) {
    const dx = obj.x - planet.x;
    const dy = obj.y - planet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < obj.radius + planet.radius) {
      // Collision: try again
      return createPlanet(worldX, worldY, objects);
    }
  }

  console.log(planet);

  return planet;
}
