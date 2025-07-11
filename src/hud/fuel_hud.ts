import { Graphics, Container, Sprite } from "pixi.js";
import { sprites } from "../sprites/sprites";
import { Frank } from "../frank/frank";

export class FuelHud {
  container = new Container();
  fuelSprite = new Sprite();
  fuelSpriteMask = new Sprite();
  fuelMask = sprites["jetpack_mask"]; // SpaceTexture
  fuelFill = new Graphics();

  constructor(x: number, y: number) {
    this.container.label = "fuel_hud";
    this.container.x = x;
    this.container.y = y;

    // === Stomach Outline ===
    this.fuelSprite.label = "fuel";
    this.fuelSprite.texture = sprites["jetpack"]?.texture;
    this.container.addChild(this.fuelSprite);

    // === Mask Sprite ===
    this.fuelSpriteMask.label = "fuel_fill_mask";
    this.fuelSpriteMask.texture = this.fuelMask.texture;
    this.container.addChild(this.fuelSpriteMask);

    // === Fill (masked by sprite) ===
    this.fuelFill.label = "fuel_fill";
    this.fuelFill.mask = this.fuelSpriteMask;
    this.container.addChild(this.fuelFill);
  }

  update(frank: Frank) {
    const fuel = frank.jetpack?.fuel ?? 1;
    const maxFuel = frank?.jetpack?.getMaxFuel() ?? 1;
    const percent = Math.min(1, Math.max(0, fuel / maxFuel));

    const { x, y, width, height } = this.fuelMask.croppedDimensions;

    const fillHeight = height * percent;
    const fillY = y + height - fillHeight;

    this.fuelFill.clear();
    this.fuelFill.rect(x, fillY, width, fillHeight);
    this.fuelFill.fill(0x00ff00);
  }
}
