import { loadSprites } from "./src/sprites.js";
import {
  createBackgroundCanvasElementMenu,
  drawStartGame,
  drawLoadingIndicator,
  drawBackgroundMenu,
} from "./src/draw.js";
import { loadAudios } from "./src/audio.js";
import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";
import { Game } from "./src/game.js";

const body = document.getElementById("rootElement");
const legacyCanvas = document.getElementById("game");
const ctx = legacyCanvas.getContext("2d");

legacyCanvas.width = body.clientWidth;
legacyCanvas.height = body.clientHeight;

// State
let backgroundCanvasMenu = null;
let game = new Game();

async function loadPixi() {
  const pixiApp = new PIXI.Application();
  await pixiApp.init({ resizeTo: window });
  game = new Game(pixiApp);
}

async function init() {
  document.removeEventListener("click", init, { once: true });
  document.removeEventListener("keydown", init, { once: true });

  ctx.fillRect(0, 0, legacyCanvas.width, legacyCanvas.height);
  drawBackgroundMenu(ctx, backgroundCanvasMenu);
  drawLoadingIndicator(ctx, legacyCanvas);

  const minWait = new Promise((resolve) => setTimeout(resolve, 500));
  const assetLoading = Promise.all([loadSprites(), loadAudios(), loadPixi()]);

  try {
    await Promise.all([minWait, assetLoading]);
  } catch (e) {
    console.error("Failed to load resources", e);
    ctx.fillStyle = "red";
    ctx.fillText(
      "FAILED TO LOAD",
      legacyCanvas.width / 2,
      legacyCanvas.height / 2 + 40
    );
    return;
  }
  // Cleanup start game screen.
  document.getElementById("rootElement").removeChild(legacyCanvas);

  // Run the actual game
  game.run();
}

backgroundCanvasMenu = createBackgroundCanvasElementMenu();
ctx.fillStyle = "#111";
ctx.fillRect(0, 0, body.clientWidth, body.clientHeight);
drawBackgroundMenu(ctx, backgroundCanvasMenu);
drawStartGame(ctx, legacyCanvas);

document.addEventListener("click", init, { once: true });
document.addEventListener("keydown", init, { once: true });
