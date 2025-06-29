import { checkCollision } from "./collision.js";
import { getRandomCoordinateFarFrom } from "./coords.js";
import { frank, galaxy, sprites } from "../index.js";

export class Planet {
  radius = 0;
  x = 0;
  y = 0;
  color = "grey";
  sprite = undefined;
  angle = 0;

  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.sprite = this.getRandomPlanetSprite();
    this.angle = Math.random() * Math.PI * 2;
  }

  getRandomPlanetSprite() {
    const planetSprites = [
      sprites["planet_1"],
      sprites["planet_2"],
      sprites["planet_3"],
    ];
    const index = Math.floor(Math.random() * planetSprites.length);
    return planetSprites[index];
  }
}

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

export function createPlanet(minDistance, maxDistance) {
  const maxRetries = 10;

  function doCreate(retries = 0) {
    const radius = randomBetween(200, 500);
    const { x, y } = getRandomCoordinateFarFrom(0, 0, minDistance, maxDistance);
    const planet = new Planet(x, y, radius);

    for (const obj of galaxy.planets) {
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
