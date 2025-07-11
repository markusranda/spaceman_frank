import { sprites } from "../sprites/sprites";
import { SpaceItem } from "./space_item";

export class ItemKageBunshin extends SpaceItem {
  constructor() {
    super(
      "kage_bunshin",
      sprites["item_kage_bunshin"].texture,
      "Charge attack spawns a clone attacking in the same direction"
    );
  }

  override update() {
    // spawnClone(frank.position, frank.direction);
  }
}
