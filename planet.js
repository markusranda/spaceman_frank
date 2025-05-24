export class Planet {
  size = 0;
  x = 0;
  y = 0;
  color = "grey";

  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }
}

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

export function createPlanet(worldX, worldY, objects) {
  const x = Math.round(Math.random() * worldX);
  const y = Math.round(Math.random() * worldY);
  const size = randomBetween(50, 90);

  const planet = new Planet(x, y, size);
  for (const obj of objects) {
    const dx = obj.x - planet.x;
    const dy = obj.y - planet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < obj.size + planet.size) {
      // Collision: try again
      return createPlanet(worldX, worldY, objects);
    }
  }

  return planet;
}
