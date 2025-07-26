import { Application } from "pixi.js";
import { StartGameScene } from "./scenes/start_game_scene";
import { BaseScene } from "./scenes/base_scene";
import { GameScene } from "./scenes/game_scene";

export class SceneManager {
  currentScene: BaseScene | null = null;
  pixiApp: Application;

  constructor(pixiApp: Application) {
    this.pixiApp = pixiApp;

    this.setScene(StartGameScene);
  }

  setScene(
    SceneClass: new (app: Application, onComplete: () => void) => BaseScene
  ) {
    this.currentScene?.destroy();

    this.currentScene = new SceneClass(this.pixiApp, () => {
      this.setScene(GameScene);
    });
  }

  public destroy() {
    throw Error("Not implemented");
  }
}
