import { Application } from "pixi.js";
import { BaseScene } from "../scenes/base_scene";
import { GameStats } from "../game_stats";

export type SceneConstructor = new (
  app: Application,
  onComplete: (next: SceneConstructor, nextStats?: GameStats) => void,
  nextStats?: GameStats
) => BaseScene;
