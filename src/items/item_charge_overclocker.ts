import { sprites } from "../sprites/sprites";
import { SpaceItem } from "./space_item";

export class ItemChargeOverclocker extends SpaceItem {
  constructor() {
    super(
      "item_charge_overclocker",
      sprites["item_charge_overclocker"].texture,
      "Increases charge rate by 10%. Decreases cooldown rate by 10%"
    );
  }

  modifyChargeCooldown(current: number): number {
    const modifier = this.level * 0.1;
    return current * (1 - modifier);
  }

  modifyChargeUpDuration(current: number): number {
    const modifier = this.level * 0.1;
    return current * (1 - modifier);
  }
}
