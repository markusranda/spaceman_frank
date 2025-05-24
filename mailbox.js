import { frank, sprites } from "./index.js";

export class Mailbox {
  x = 0;
  y = 0;
  radius = undefined;

  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.sprite = sprites["mailbox"];
    this.radius = this.sprite.width / 2;
  }
}

export function createMailbox() {
  return new Mailbox(frank.x, frank.y);
}
