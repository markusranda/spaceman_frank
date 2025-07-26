import { Application } from "pixi.js";
import { SceneManager } from "./src/scene_manager";

async function loadPixi() {
  const pixiApp = new Application();
  await pixiApp.init({ resizeTo: window });
  // @ts-expect-error special pixi stuff
  globalThis.__PIXI_APP__ = pixiApp;
  return pixiApp;
}

async function init() {
  const pixiApp = await loadPixi();

  new SceneManager(pixiApp);
}

init();
