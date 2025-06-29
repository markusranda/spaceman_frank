import { frank, sprites } from "../index.js";

export class Mailbox {
  x = 0;
  y = 0;
  radius = undefined;

  constructor() {
    this.sprite = sprites["mailbox"];
    this.radius = this.sprite.width / 2;
  }
}

export function createMailbox() {
  return new Mailbox();
}
