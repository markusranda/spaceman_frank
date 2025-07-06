import { Container, Sprite } from "pixi.js";

export class Entity {
  x = 0;
  y = 0;
  radius = 0;
  dead = false;
  sprite = new Sprite();

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite.x = x;
    this.sprite.y = y;
  }

  destroy() {
    this.sprite.destroy({ children: true, texture: false });
  }

  addTo(container: Container) {
    container.addChild(this.sprite);
  }
}
