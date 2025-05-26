import { checkCollision } from "./collision.js";
import { getRandomCoordinateFarFrom } from "./coords.js";
import { frank, planets } from "./index.js";

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

export function createPlanet(maxDistance) {
  const maxRetries = 10;

  function doCreate(retries = 0) {
    const radius = randomBetween(50, 90);
    const { x, y } = getRandomCoordinateFarFrom(
      0,
      0,
      500 + radius,
      maxDistance
    );
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
