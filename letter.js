import { checkCollision } from "./collision.js";
import { getRandomCoordinateFarFrom } from "./coords.js";
import { frank, level, planets, sprites } from "./index.js";

export class Letter {
  x = 0;
  y = 0;
  radius = undefined;
  angle = (3 * Math.pi) / 2;
  id = "";

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.id = `letter_${new Date().getUTCMilliseconds()}_${Math.random()}`;
    this.sprite = sprites["letter"];
    this.radius = this.sprite.width / 2;
  }
}

function checkPlanetCollision(letter) {
  for (const planet of planets) {
    if (checkCollision(letter, planet, 10)) return true;
  }

  return false;
}

function checkLetterCollision(letterA) {
  for (const letterB of level.letters) {
    if (checkCollision(letterA, letterB, 10)) return true;
  }

  return false;
}

export function createLetter(maxDistance) {
  const maxRetries = 10;

  function doCreate(retries = 0) {
    const { x, y } = getRandomCoordinateFarFrom(0, 0, 500, maxDistance);

    const letter = new Letter(x, y);
    if (
      checkCollision(letter, frank, 50) ||
      checkPlanetCollision(letter) ||
      checkLetterCollision(letter)
    ) {
      if (retries < maxRetries) {
        return doCreate(retries + 1);
      } else {
        console.warn("Too many retries, there's no more room for letters");
        return null;
      }
    }

    return letter;
  }

  return doCreate();
}
