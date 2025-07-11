import { Entity } from "../entity";
import { sprites } from "../sprites";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { OutlineFilter } from "pixi-filters";

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
  animationFrames = [
    sprites.crack_animation_0.texture,
    sprites.crack_animation_1.texture,
    sprites.crack_animation_2.texture,
    sprites.crack_animation_3.texture,
    sprites.crack_animation_4.texture,
    sprites.crack_animation_5.texture,
    sprites.crack_animation_6.texture,
    sprites.crack_animation_7.texture,
  ];
  crackSprite = new Sprite();
  previousCrackIndex = -1;

  constructor(x: number, y: number, radius: number, sprite?: Sprite | null) {
    super();
    this.x = x;
    this.y = y;
    this.radius = radius;

    if (!sprite) this.planetSprite = this.getRandomPlanetSprite();
    else this.planetSprite = sprite;

    this.shadowSprite.texture = sprites["planet_shadow"]?.texture;

    this.planetSprite.label = "planet_sprite";
    this.planetSprite.anchor.set(0.5);
    this.planetSprite.width = radius * 2;
    this.planetSprite.height = radius * 2;

    this.crackSprite.label = "crack_sprite";
    this.crackSprite.anchor.set(0.5);
    this.crackSprite.width = radius * 2;
    this.crackSprite.height = radius * 2;
    this.crackSprite.rotation = Math.random() * 2 * Math.PI;
    this.crackSprite.tint = 0x000000;
    this.crackSprite.alpha = 0.3;

    this.shadowSprite.label = "shadow_sprite";
    this.shadowSprite.anchor.set(0.5);
    this.shadowSprite.width = radius * 2;
    this.shadowSprite.height = radius * 2;
    this.shadowSprite.position.set(0, 0); // since it's centered

    this.container.label = "planet";
    this.container.cullable = true;
    this.container.addChild(this.planetSprite);
    this.container.position.set(this.x, this.y);

    const planetMask = new Sprite(sprites["planet_mask"]?.texture);
    planetMask.anchor.set(0.5);
    planetMask.width = radius * 2;
    planetMask.height = radius * 2;

    this.populateShadowContainer(this.radius);

    this.rotateShadowTowardSun();

    this.debugText.label = "debug_text";
    this.debugText.style = { fontSize: 24, fill: 0xffffff, align: "center" };
    this.debugText.anchor.set(0.5);
    this.debugText.position.set(0, 0);

    this.container.addChild(this.crackSprite);
    this.container.addChild(this.shadowContainer);
    this.container.addChild(this.debugText);
    this.container.setMask({ mask: planetMask, inverse: false });
    this.container.addChild(planetMask);

    this.planetSprite.texture.source.scaleMode = "nearest";
    this.shadowSprite.texture.source.scaleMode = "nearest";
    planetMask.texture.source.scaleMode = "nearest";
  }

  update() {
    if (this.dead) return;
    this.debugText.text = this.health;
    this.updateCrack();
  }

  updateCrack() {
    if (this.health >= this.maxHealth) {
      this.crackSprite.visible = false;
      return;
    }
    this.crackSprite.visible = true;

    // Index
    const percentHealth = 1 - this.health / this.maxHealth;
    const index = Math.floor(percentHealth * this.animationFrames.length);
    if (this.previousCrackIndex === index) return;
    this.previousCrackIndex = index;

    // Texture
    const texture =
      this.animationFrames[Math.min(index, this.animationFrames.length - 1)];
    this.crackSprite.texture = texture;
    this.crackSprite.texture.source.scaleMode = "nearest";
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
