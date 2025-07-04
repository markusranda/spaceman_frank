import { sprites } from "./sprites.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

export class Planet {
  radius = 0;
  x = 0;
  y = 0;
  sprite = undefined;
  shadowContainer = undefined;
  angle = 0;
  type = "planet";
  dead = false;

  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.sprite = this.getRandomPlanetSprite();
    const spriteRadius = this.sprite.width / 2;
    this.shadowContainer = this.createShadowSprite(spriteRadius);

    this.sprite.width = radius * 2;
    this.sprite.height = radius * 2;

    this.sprite.addChild(this.shadowContainer);

    // Rotate towards sun
    this.rotateSpriteTowardZero();
  }

  update() {}

  rotateSpriteTowardZero() {
    const dx = this.x;
    const dy = this.y;
    this.sprite.rotation = Math.atan2(dy, dx);
  }

  createShadowSprite(radius) {
    const shadowContainer = new PIXI.Container();
    shadowContainer.name = "shadow_container";

    // Full black circle
    const shadow1 = new PIXI.Graphics();
    shadow1.beginFill(0x000000, 0.55);
    shadow1.circle(radius, radius, radius + 1);
    shadow1.endFill();

    // The shape we'll use to subtract from the shadow
    const cutter = new PIXI.Graphics();
    cutter.beginFill(0xffffff);
    cutter.circle(radius * 0.5, radius, radius + 1);
    cutter.endFill();

    shadowContainer.setMask({ mask: cutter, inverse: true });

    shadowContainer.addChild(shadow1);
    shadowContainer.addChild(cutter);

    return shadowContainer;
  }

  getRandomPlanetSprite() {
    const planetSprites = [
      sprites["planet_1"],
      sprites["planet_2"],
      sprites["planet_3"],
    ];
    const index = Math.floor(Math.random() * planetSprites.length);
    const planet = new PIXI.Sprite(planetSprites[index]);
    planet.name = "planet";
    return planet;
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
