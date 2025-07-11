import { sprites } from "../sprites/sprites";
import { SpaceItem } from "./space_item";

export class ItemRocketThrusters extends SpaceItem {
  constructor(x: number, y: number) {
    super(
      x,
      y,
      "rocket_thrusters",
      sprites["item_rocket_thrusters"]?.texture,
      "Increases acceleration by 10%. Increases maxSpeed by 10%"
    );
  }

  override modifyAcceleration(current: number): number {
    const modifier = this.level * 0.1;
    return current * (1 + modifier);
  }

  override modifyMaxSpeed(current: number): number {
    const modifier = this.level * 0.1;
    return current * (1 + modifier);
  }
}
