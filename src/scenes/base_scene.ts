import { Application } from "pixi.js";
import { SceneConstructor } from "../models/scene_constructor";

export class BaseScene {
  pixiApp: Application;
  onComplete: (scene: SceneConstructor) => void;

  constructor(
    pixiApp: Application,
    onComplete: (scene: SceneConstructor) => void
  ) {
    this.pixiApp = pixiApp;
    this.onComplete = onComplete;
  }

  destroy() {
    throw new Error("Method not implemented.");
  }
}
