import { sprites } from "./sprites.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

export class Planet {
  radius = 0;
  x = 0;
  y = 0;
  color = "grey";
  sprite = undefined;
  angle = 0;
  type = "planet";
  dead = false;

  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.sprite = this.getRandomPlanetSprite();
    this.sprite.width = radius * 2;
    this.sprite.height = radius * 2;
    this.angle = Math.random() * Math.PI * 2;
  }

  getRandomPlanetSprite() {
    const planetSprites = [
      sprites["planet_1"],
      sprites["planet_2"],
      sprites["planet_3"],
    ];
    const index = Math.floor(Math.random() * planetSprites.length);
    return new PIXI.Sprite(planetSprites[index]);
  }

  addTo(container) {
    if (!this.sprite.added) {
      container.addChild(this.sprite);
      this.sprite.x = this.x - this.radius;
      this.sprite.y = this.y - this.radius;
      this.sprite.added = true;
      this.sprite.cullable = true;
    }
  }

  destroy() {
    this.sprite.destroy({ children: true, texture: false, baseTexture: false });
  }
}
