import { Application } from "pixi.js";

export class BaseScene {
  pixiApp: Application;
  onComplete: () => void;

  constructor(pixiApp: Application, onComplete: () => void) {
    this.pixiApp = pixiApp;
    this.onComplete = onComplete;
  }

  destroy() {
    throw new Error("Method not implemented.");
  }
}
