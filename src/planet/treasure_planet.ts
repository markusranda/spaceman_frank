import { Sprite } from "pixi.js";
import { sprites } from "../sprites/sprites";
import { Planet } from "./planet";

export class TreasurePlanet extends Planet {
  constructor(x: number, y: number, radius: number) {
    const texture = sprites["planet_treasure"]?.texture;

    const sprite = new Sprite(texture);
    super(x, y, radius, sprite);
  }
}
