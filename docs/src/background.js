import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.0.2/dist/pixi.mjs";

export class Background {
  constructor() {}

  addTo(container) {
    const sun = new PIXI.Graphics();
    sun.circle(0, 0, 400);
    sun.fill({ color: "#ffd200" });
    sun.cullable = true;

    container.addChild(sun);
  }
}
