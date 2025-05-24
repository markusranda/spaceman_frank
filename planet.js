import { checkCollision } from "./collision.js";
import { frank, planets, worldX, worldY } from "./index.js";

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

export function createPlanet() {
  const maxRetries = 10;

  function doCreate(retries = 0) {
    const x = Math.round(Math.random() * worldX);
    const y = Math.round(Math.random() * worldY);
    const radius = randomBetween(50, 90);

    const planet = new Planet(x, y, radius);

    for (const obj of planets) {
      if (
        checkCollision(obj, planet, 10) ||
        checkCollision(frank, planet, 50)
      ) {
        if (retries < maxRetries) {
          return doCreate(retries + 1);
        } else {
          console.warn("Too many retries, there's no more room for planets");
          return null;
        }
      }
    }

    return planet;
  }

  return doCreate();
}
