import { Application } from "pixi.js";
import { SceneConstructor } from "../models/scene_constructor";
import { GameStats } from "../game_stats";

export class BaseScene {
  pixiApp: Application;
  onComplete: (scene: SceneConstructor, stats?: GameStats) => void;

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
