import { Application } from "pixi.js";
import { BaseScene } from "../scenes/base_scene";

export type SceneConstructor = new (
  app: Application,
  onComplete: (next: SceneConstructor) => void
) => BaseScene;
