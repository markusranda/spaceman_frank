import { Application } from "pixi.js";
import { StartGameScene } from "./scenes/start_game_scene";
import { BaseScene } from "./scenes/base_scene";
import { SceneConstructor } from "./models/scene_constructor";
import { GameStats } from "./game_stats";

export class SceneManager {
  currentScene: BaseScene | null = null;
  pixiApp: Application;

  constructor(pixiApp: Application) {
    this.pixiApp = pixiApp;

    this.setScene(StartGameScene);
  }

  setScene(SceneClass: SceneConstructor, gameStats?: GameStats) {
    this.currentScene?.destroy();
    this.currentScene = new SceneClass(
      this.pixiApp,
      (nextScene, gameStats) => {
        this.setScene(nextScene, gameStats);
      },
      gameStats
    );
  }

  public destroy() {
    throw Error("Not implemented");
  }
}
