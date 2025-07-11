import { Container, Sprite } from "pixi.js";
import { Frank } from "../frank/frank";

export class ItemsHud {
  container: Container;
  private x: number;
  private y: number;
  private spacing = 40;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.container = new Container();
    this.container.label = "items_hud";
    this.container.x = x;
    this.container.y = y;
  }

  update(frank: Frank) {
    this.container.removeChildren();

    for (let i = 0; i < Object.values(frank.items).length; i++) {
      const item = Object.values(frank.items)[i];
      const sprite = new Sprite(item.texture);
      sprite.anchor.set(0.5);
      sprite.width = 32;
      sprite.height = 32;
      sprite.x = i * this.spacing;
      sprite.y = 0;

      this.container.addChild(sprite);
    }
  }
}
