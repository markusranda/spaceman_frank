import { sprites } from "../index.js";

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
