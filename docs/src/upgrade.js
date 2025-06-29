import { sprites } from "./sprites.js";

export class Upgrade {
  name = "";
  level = 1;
  sprite = undefined;

  constructor(name) {
    this.name = name;
    this.sprite = sprites[name];
  }
}
