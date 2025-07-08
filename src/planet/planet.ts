import { Entity } from "../entity";
import { sprites } from "../sprites";
import { Container, Graphics, Sprite, Text } from "pixi.js";

export class Planet extends Entity {
  radius = 0;
  x = 0;
  y = 0;
  planetSprite = new Sprite();
  shadowSprite = new Sprite();
  container = new Container();
  debugText = new Text();
  shadowContainer = new Container();
  shadowContainerMask = new Graphics();
  angle = 0;
  type = "planet";

  constructor(x: number, y: number, radius: number, sprite?: Sprite | null) {
    super();
    this.x = x;
    this.y = y;
    this.radius = radius;

    if (!sprite) this.planetSprite = this.getRandomPlanetSprite();
    else this.planetSprite = sprite;

    this.shadowSprite.texture = sprites["planet_shadow"]?.texture;
    this.planetSprite.anchor.set(0.5);
    this.planetSprite.width = radius * 2;
    this.planetSprite.height = radius * 2;

    this.shadowSprite.anchor.set(0.5);
    this.shadowSprite.width = radius * 2;
    this.shadowSprite.height = radius * 2;
    this.shadowSprite.position.set(0, 0); // since it's centered

    this.container.label = "planet";
    this.container.cullable = true;
    this.container.addChild(this.planetSprite);
    this.container.position.set(this.x, this.y);

    this.populateShadowContainer(this.radius);
    this.container.addChild(this.shadowContainer);

    this.rotateShadowTowardSun();

    this.debugText.style = { fontSize: 24, fill: 0xffffff, align: "center" };
    this.debugText.anchor.set(0.5);
    this.debugText.position.set(0, 0);
    this.container.addChild(this.debugText);

    this.planetSprite.texture.source.scaleMode = "nearest";
    this.shadowSprite.texture.source.scaleMode = "nearest";
  }

  update() {
    this.debugText.text = this.health;
  }

  rotateShadowTowardSun() {
    const dx = -this.x;
    const dy = -this.y;
    const angle = Math.atan2(dy, dx);
    this.shadowContainerMask.rotation = angle;
  }

  populateShadowContainer(radius: number) {
    const shadowContainer = this.shadowContainer;
    shadowContainer.label = "shadow_container";

    // Clean up anchor/pivot confusion
    shadowContainer.pivot.set(0, 0);
    shadowContainer.position.set(0, 0);

    // Create cutter mask centered on the same origin
    this.shadowContainerMask.circle(radius / 6, 0, radius); // centered at (0,0)
    this.shadowContainerMask.fill({ color: 0xffffff });

    shadowContainer.setMask({ mask: this.shadowContainerMask, inverse: true });

    shadowContainer.addChild(this.shadowSprite);
    shadowContainer.addChild(this.shadowContainerMask);
  }

  getRandomPlanetSprite() {
    const planetSprites = [
      sprites["planet_1"]?.texture,
      sprites["planet_2"]?.texture,
      sprites["planet_3"]?.texture,
    ];
    const index = Math.floor(Math.random() * planetSprites.length);
    const planet = new Sprite(planetSprites[index]);
    planet.label = "planet";
    return planet;
  }

  addTo(container: Container): void {
    container.addChild(this.container);
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
