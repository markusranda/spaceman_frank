import { loadSprites } from "./src/sprites";
import {
  createBackgroundCanvasElementMenu,
  drawStartGame,
  drawLoadingIndicator,
  drawBackgroundMenu,
} from "./src/draw";
import { loadAudios } from "./src/audio";
import { Application } from "pixi.js";
import { Game } from "./src/game";

// Initialize
const body = document.getElementById("rootElement");
if (!body) throw Error("Can't start game without element body");
const legacyCanvas = document.getElementById(
  "game"
) as HTMLCanvasElement | null;
if (!legacyCanvas) throw Error("Can't start game without element by id game");
legacyCanvas.width = body.clientWidth;
legacyCanvas.height = body.clientHeight;
const ctx = legacyCanvas.getContext("2d");
if (!ctx) throw Error("Can't start game without ctx");
let backgroundCanvasMenu: HTMLCanvasElement | null = null;
backgroundCanvasMenu = createBackgroundCanvasElementMenu();
ctx.fillStyle = "#111";
ctx.fillRect(0, 0, body.clientWidth, body.clientHeight);
drawBackgroundMenu(ctx, backgroundCanvasMenu);
drawStartGame(ctx, legacyCanvas);

async function loadPixi() {
  const pixiApp = new Application();
  await pixiApp.init({ resizeTo: window });

  return pixiApp;
}

async function init() {
  if (!ctx) throw Error("Can't start game without ctx");
  if (!legacyCanvas) throw Error("Can't start game without element by id game");
  if (!body) throw Error("Can't start game without element body");

  document.removeEventListener("click", init);
  document.removeEventListener("keydown", init);

  ctx.fillRect(0, 0, legacyCanvas.width, legacyCanvas.height);
  drawBackgroundMenu(ctx, backgroundCanvasMenu);
  drawLoadingIndicator(ctx, legacyCanvas);

  const minWait = new Promise((resolve) => setTimeout(resolve, 500));
  const assetLoading = Promise.all([loadSprites(), loadAudios()]);
  const pixiApp = await loadPixi();

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
  body.removeChild(legacyCanvas);

  // Run the actual game
  new Game(pixiApp);
}

document.addEventListener("click", init, { once: true });
document.addEventListener("keydown", init, { once: true });
