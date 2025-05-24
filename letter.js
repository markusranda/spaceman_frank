import { checkCollision } from "./collision.js";
import { frank, planets } from "./index.js";

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

    const sprite = new Image();
    sprite.src = "letter.png";
    this.sprite = sprite;
    this.radius = this.sprite.width / 2;
  }
}

export function createLetter(worldX, worldY) {
  const maxRetries = 10;

  function doCreate(retries = 0) {
    console.log(`Retry: ${retries}`);
    const x = Math.round(Math.random() * worldX);
    const y = Math.round(Math.random() * worldY);

    const letter = new Letter(x, y);
    for (const planet of planets) {
      if (
        checkCollision(letter, planet, 10) ||
        checkCollision(letter, frank, 50)
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
  }

  return doCreate();
}
