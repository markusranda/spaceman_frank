import { Sprite } from "pixi.js";
import { sprites } from "../sprites/sprites";
import { Planet } from "./planet";
import { eventQueue } from "../event_queue/event_queue";
import { SpaceEventSpawnItem } from "../event_queue/space_event_spawn_item";
import { ItemFuelTank } from "../items/item_fuel_tank";
import { ItemKageBunshin } from "../items/item_kage_bunshin";
import { ItemRocketThrusters } from "../items/item_rocket_thruster";
import { ItemChargeOverclocker } from "../items/item_charge_overclocker";

export class TreasurePlanet extends Planet {
  constructor(x: number, y: number, radius: number) {
    const texture = sprites["planet_treasure"]?.texture;

    const sprite = new Sprite(texture);
    super(x, y, radius, sprite);
  }

  destroy(): void {
    this.container.destroy({ children: true });
    const randomItemClass = this.getRandomItemClass();
    const event = new SpaceEventSpawnItem(this.x, this.y, randomItemClass);
    eventQueue.emit(event);
  }

  getRandomItemClass() {
    const items = [
      ItemChargeOverclocker,
      ItemFuelTank,
      ItemKageBunshin,
      ItemRocketThrusters,
    ];
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
}
