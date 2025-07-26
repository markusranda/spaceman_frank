import { Application } from "pixi.js";
import { StartGameScene } from "./scenes/start_game_scene";
import { BaseScene } from "./scenes/base_scene";
import { SceneConstructor } from "./models/scene_constructor";

export class SceneManager {
  currentScene: BaseScene | null = null;
  pixiApp: Application;

  constructor(pixiApp: Application) {
    this.pixiApp = pixiApp;

    this.setScene(StartGameScene);
  }

  setScene(SceneClass: SceneConstructor) {
    this.currentScene?.destroy();
    this.currentScene = new SceneClass(this.pixiApp, (nextScene) => {
      this.setScene(nextScene);
    });
  }

  public destroy() {
    throw Error("Not implemented");
  }
}
