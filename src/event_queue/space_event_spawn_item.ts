import { SpaceItem } from "../items/space_item";
import { SpaceEvent } from "./space_events";

type Constructor<T> = new (...args: any[]) => T;

export class SpaceEventSpawnItem extends SpaceEvent {
  x = 0;
  y = 0;
  classType: Constructor<SpaceItem>;

  constructor(x: number, y: number, itemType: Constructor<SpaceItem>) {
    super();
    this.x = x;
    this.y = y;
    this.classType = itemType;
  }
}
