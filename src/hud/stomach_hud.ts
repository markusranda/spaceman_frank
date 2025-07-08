import { Graphics, Container, Sprite } from "pixi.js";
import { sprites } from "../sprites";
import { Frank } from "../frank/frank";

export class StomachHud {
  container = new Container();
  stomachSprite = new Sprite();
  stomachSpriteMask = new Sprite();
  stomachMask = sprites["stomach_mask"]; // SpaceTexture
  stomachFill = new Graphics();

  constructor(x: number, y: number) {
    this.container.label = "stomach_hud";
    this.container.x = x;
    this.container.y = y;

    // === Stomach Outline ===
    this.stomachSprite.label = "stomach";
    this.stomachSprite.texture = sprites["stomach"]?.texture;
    this.container.addChild(this.stomachSprite);

    // === Mask Sprite ===
    this.stomachSpriteMask.label = "stomach_fill_mask";
    this.stomachSpriteMask.texture = this.stomachMask.texture;
    this.container.addChild(this.stomachSpriteMask);

    // === Fill (masked by sprite) ===
    this.stomachFill.label = "stomach_fill";
    this.stomachFill.mask = this.stomachSpriteMask;
    this.container.addChild(this.stomachFill);
  }

  update(frank: Frank) {
    const percent = Math.min(
      1,
      Math.max(0, frank.fullness / frank.getFullnessGoal())
    );
    const { x, y, width, height } = this.stomachMask.croppedDimensions;

    const fillHeight = height * percent;
    const fillY = y + height - fillHeight;

    this.stomachFill.clear();
    this.stomachFill.beginFill(0xff69b4);
    this.stomachFill.rect(x, fillY, width, fillHeight);
    this.stomachFill.endFill();
  }
}
