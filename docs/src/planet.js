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

    // Set sprite pivot to center
    const textureRadius = this.sprite.width / 2;
    this.sprite.pivot.set(textureRadius, textureRadius);

    // Set sprite size and position
    this.sprite.width = radius * 2;
    this.sprite.height = radius * 2;
    this.sprite.position.set(this.x, this.y); // pivoted, so (x, y) is center

    // Create shadow and add it
    this.shadowContainer = this.createShadowSprite(textureRadius);
    this.sprite.addChild(this.shadowContainer);

    // Rotate shadow to face sun
    this.rotateShadowTowardSun();
  }

  update() {}

  rotateShadowTowardSun() {
    // Angle from planet to origin
    const dx = this.x;
    const dy = this.y;
    const angle = Math.atan2(dy, dx);

    this.shadowContainer.rotation = angle;
  }

  createShadowSprite(radius) {
    const shadowContainer = new PIXI.Container();
    shadowContainer.name = "shadow_container";

    // Align rotation around center
    shadowContainer.pivot.set(radius, radius);
    shadowContainer.position.set(radius, radius);

    // Shadow
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.55);
    shadow.circle(radius, radius, radius + 1);
    shadow.endFill();

    const cutter = new PIXI.Graphics();
    cutter.beginFill(0xffffff);
    cutter.circle(radius * 0.5, radius, radius + 1);
    cutter.endFill();

    shadowContainer.setMask({ mask: cutter, inverse: true });
    shadowContainer.addChild(shadow);
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
      this.sprite.added = true;
      this.sprite.cullable = true;
    }
  }

  destroy() {
    this.sprite.destroy({ children: true, texture: false, baseTexture: false });
  }
}
