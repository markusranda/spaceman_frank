import { Entity } from "./entity";
import { sprites } from "./sprites";
import { Container, Graphics, Sprite } from "pixi.js";

export class Planet extends Entity {
  radius = 0;
  x = 0;
  y = 0;
  sprite = new Sprite();
  shadowContainer = new Container();
  angle = 0;
  type = "planet";
  dead = false;

  constructor(x: number, y: number, radius: number) {
    super();
    this.sprite.cullable = true;
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
    this.populateShadowContainer(textureRadius);
    this.sprite.addChild(this.shadowContainer);

    // Rotate shadow to face sun
    this.rotateShadowTowardSun();
  }

  rotateShadowTowardSun() {
    // Angle from planet to origin
    const dx = this.x;
    const dy = this.y;
    const angle = Math.atan2(dy, dx);

    this.shadowContainer.rotation = angle;
  }

  populateShadowContainer(radius: number) {
    const shadowContainer = this.shadowContainer;
    shadowContainer.label = "shadow_container";

    // Align rotation around center
    shadowContainer.pivot.set(radius, radius);
    shadowContainer.position.set(radius, radius);

    // Shadow
    const shadow = new Graphics();
    shadow.circle(radius, radius, radius + 1);
    shadow.fill({ color: 0x000000, alpha: 0.55 });

    const cutter = new Graphics();
    cutter.circle(radius * 0.5, radius, radius + 1);
    cutter.fill({ color: 0xffffff });

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
    const planet = new Sprite(planetSprites[index]);
    planet.label = "planet";
    return planet;
  }
}
