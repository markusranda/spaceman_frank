import { Container, Sprite, Texture } from "pixi.js";
import { Frank } from "../frank/frank";
import { Universe } from "../universe/universe";
import { GlowFilter } from "pixi-filters";

export abstract class SpaceItem {
  x: number;
  y: number;
  id: string;
  container = new Container();
  sprite = new Sprite();
  texture: Texture;
  description: string;
  level = 1;
  aquired = false;
  radius = 32;

  constructor(
    x: number,
    y: number,
    id: string,
    texture: Texture,
    description: string
  ) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.description = description;

    this.texture = texture;
    this.sprite.texture = this.texture;
    this.container.addChild(this.sprite);
    this.container.x = x;
    this.container.y = y;
    this.container.filters = [
      new GlowFilter({ innerStrength: 1, outerStrength: 10, color: 0xffe066 }),
    ];
  }

  // Default stat modification hooks
  modifyAcceleration(current: number): number {
    return current;
  }

  modifyMaxSpeed(current: number): number {
    return current;
  }

  modifyChargeUpDuration(current: number): number {
    return current;
  }

  modifyChargeCooldown(current: number): number {
    return current;
  }

  modifyMaxFuel(current: number): number {
    return current;
  }

  addTo(container: Container) {
    container.addChild(this.container);
  }

  destroy() {
    this.container.destroy({ children: true });
  }

  // Default behavior hook
  update(
    _frank: Frank,
    _universe: Universe,
    _delta: number,
    _container: Container
  ): void {}
}
