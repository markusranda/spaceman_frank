import { loadSprites } from "./src/sprites.js";
import { Frank } from "./src/frank.js";
import { Galaxy } from "./src/galaxy.js";
import {
  createBackgroundCanvasElement,
  drawBackground,
  drawDamaged,
  drawFlame,
  drawFrank,
  drawTheSun,
  drawLevelCleared,
  drawCompass,
  drawParticles,
  drawPlanets,
  drawUpgradeHUD,
  drawSonar,
  drawFuelUI,
  drawFullnessUI,
  drawStartGame,
} from "./src/draw.js";
import {
  updateCamera,
  updateFrank,
  updateParticles,
  updatePlanets,
  updateThrusterAudio,
  updateTimers,
} from "./src/update.js";
import { loadAudios } from "./src/audio.js";

const body = document.getElementById("rootElement");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

export const worldX = body.clientWidth;
export const worldY = body.clientHeight;
canvas.width = worldX;
canvas.height = worldY;

// State
let backgroundCanvas = null;
export let frank = undefined;
export let galaxy = new Galaxy();
export let particles = [];
export let upgradeTracker = {};
export let windowState = {
  lastClick: null,
  buttons: [],
};
export let gameState = {
  victoryState: false,
  upgradeState: false,
  sonarState: false,
};
export let availableUpgrades = [];
export const timers = {
  damagedTimer: 0,
};

export const DAMAGE_TIMER_MAX = 1000;

let frameId = 0;
let lastTime = 0;

export const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
};

export const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  " ": false,
};

// FPS counter state
let fpsFrameCount = 0;
let fpsLastTime = performance.now();

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() in keys) {
    keys[e.key.toLowerCase()] = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() in keys) {
    keys[e.key.toLowerCase()] = false;
  }
});

window.addEventListener("click", (e) => {
  windowState.lastClick = { x: e.offsetX, y: e.offsetY };
});

function hasEatenEnoughPlanets() {
  return frank.fullness >= frank.getFullnessGoal();
}

function update(delta) {
  if (hasEatenEnoughPlanets()) evolveGalaxy();

  updateCamera();
  updateThrusterAudio();
  updateFrank();
  updateParticles();
  updateTimers(delta);
  updatePlanets();
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, worldX, worldY);

  drawBackground(ctx, backgroundCanvas);

  drawTheSun(ctx);
  drawSonar(ctx);
  drawFrank(ctx);
  drawPlanets(ctx);
  drawFlame(ctx);
  drawFuelUI(ctx);
  drawFullnessUI(ctx);

  if (gameState.victoryState) {
    drawParticles(ctx);
    drawLevelCleared(ctx, canvas);
  }
  drawDamaged(ctx, canvas);
  drawCompass(ctx, canvas);
  drawUpgradeHUD(ctx, canvas);

  if (gameState.upgradeState) {
    // Placeholder
  }
}

function loop(currentTime) {
  const delta = currentTime - lastTime;

  update(delta);
  draw();

  // FPS tracking
  fpsFrameCount++;
  const fpsNow = performance.now();
  if (fpsNow - fpsLastTime >= 1000) {
    const fps = (fpsFrameCount / (fpsNow - fpsLastTime)) * 1000;
    console.debug(`FPS: ${fps.toFixed(1)}`);
    fpsFrameCount = 0;
    fpsLastTime = fpsNow;
  }

  lastTime = currentTime;
  frameId = requestAnimationFrame(loop);
}

function runGame() {
  // Reset state completely
  cancelAnimationFrame(frameId);

  // Spawn
  frank = new Frank(0, 0);
  for (let i = 0; i < 10; i++) {
    galaxy.spawnNextPlanetBelt(frank);
    galaxy.currentEvolution++;
  }

  // Run
  frameId = requestAnimationFrame(() => loop(0));
}

function doEvolveGalaxy() {
  gameState.victoryState = false;
  particles = [];
  galaxy.spawnNextPlanetBelt(frank);
  galaxy.currentEvolution++;
}

function spawnVictoryParticles(count = 1000) {
  const arcStart = 0; // Start angle (e.g. 10 o'clock)
  const arcEnd = 2 * Math.PI; // End angle (e.g. 2 o'clock)

  for (let i = 0; i < count; i++) {
    const angle = arcStart + Math.random() * (arcEnd - arcStart);
    const speed = 2 + Math.random() * 6;

    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 60 + Math.random() * 60,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
    });
  }
}

function evolveGalaxy() {
  gameState.victoryState = true;
  frank.evolve(galaxy);
  spawnVictoryParticles();

  setTimeout(() => {
    doEvolveGalaxy();
  }, 1500);
}

async function init() {
  await loadSprites();
  await loadAudios();
  runGame();
}

window.addEventListener(
  "DOMContentLoaded",
  () => {
    backgroundCanvas = createBackgroundCanvasElement();
    canvas.onre;
    setTimeout(() => {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, worldX, worldY);
      drawBackground(ctx, backgroundCanvas);
      drawStartGame(ctx, canvas);
    }, 100);

    document.addEventListener("click", init, { once: true });
    document.addEventListener("keydown", init, { once: true });
  },
  { once: true }
);
