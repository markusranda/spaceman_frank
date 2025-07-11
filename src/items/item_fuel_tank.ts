import { sprites } from "../sprites/sprites";
import { SpaceItem } from "./space_item";

export class ItemFuelTank extends SpaceItem {
  constructor(x: number, y: number) {
    super(
      x,
      y,
      "item_fuel_tank",
      sprites["item_fuel_tank"]?.texture,
      "Increases fuel capacity by 10%"
    );
  }

  override modifyMaxFuel(current: number) {
    const modifier = this.level * 0.1;
    return current * (1 + modifier);
  }
}
