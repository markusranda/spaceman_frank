import { drawBackgroundCanvasElement } from "./src/background.js";
import { Frank } from "./src/frank.js";
import { createPlanet } from "./src/planet.js";
import { Galaxy } from "./src/galaxy.js";
import {
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
} from "./src/draw.js";
import {
  updateCamera,
  updateFrank,
  updateParticles,
  updatePlanets,
  updateSonar,
  updateThrusterAudio,
  updateTimers,
} from "./src/update.js";

const body = document.getElementById("rootElement");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let backgroundCanvas;
export function setBackgroundCanvas(canvas) {
  backgroundCanvas = canvas;
}
export function getBackgroundCanvas() {
  return backgroundCanvas;
}

export const worldX = body.clientWidth;
export const worldY = body.clientHeight;
canvas.width = worldX;
canvas.height = worldY;

// State
export const sprites = {};
export let frank = undefined;
export let galaxy = new Galaxy();
export let mailbox = undefined;
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
let lastDmgAudioIndex = 0;

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

function hasEatenEnoughRocks() {
  // Check if Frank has eaten enough rocks
  return false;
}

function update(delta) {
  if (hasEatenEnoughRocks()) evolveGalaxy();

  updateCamera();
  updateThrusterAudio();
  updateFrank();
  updateParticles();
  updateTimers(delta);
  updateSonar();
  updatePlanets();
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, worldX, worldY);

  drawBackground(ctx);

  drawTheSun(ctx);
  drawSonar(ctx);
  drawFrank(ctx);
  drawPlanets(ctx);
  drawFlame(ctx);

  if (gameState.victoryState) {
    drawParticles(ctx);
    drawLevelCleared(ctx, canvas);
  }
  drawDamaged(ctx, canvas);
  drawCompass(ctx, canvas);
  drawUpgradeHUD(ctx, canvas);

  if (gameState.upgradeState) {
  }
}

function loop(currentTime) {
  const delta = currentTime - lastTime;

  update(delta);
  draw();

  lastTime = currentTime;
  frameId = requestAnimationFrame((newTime) => loop(newTime));
}

function runGame() {
  // Reset state completely
  cancelAnimationFrame(frameId);

  // Reset world
  frank = new Frank(0, 0);

  // Spawn stuff
  for (let i = 0; i < 4 + galaxy.evolutions; i++) {
    const planet = createPlanet(1000, 1500);
    if (planet) galaxy.planets.push(planet);
  }

  // Run
  frameId = requestAnimationFrame(() => loop(0));
}

function doEvolveGalaxy() {
  gameState.victoryState = false;
  particles = [];
  frank.fuel = frank.maxFuel;
  galaxy.evolutions++;

  // Spawn stuff
  for (let i = 0; i < 4 + galaxy.evolutions; i++) {
    const planet = createPlanet(
      1500 + 500 * galaxy.evolutions,
      1500 + 500 * galaxy.evolutions + 1
    );
    if (planet) galaxy.planets.push(planet);
  }
  for (let i = 0; i < 5; i++) {
    const letter = createLetter(
      1500 + 500 * galaxy.evolutions,
      1500 + 500 * galaxy.evolutions + 1
    );
    if (letter) galaxy.letters.push(letter);
  }
  if (galaxy.letters.length < 1)
    throw Error("No letters were created, game failed to be created");
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
  spawnVictoryParticles();

  setTimeout(() => {
    doEvolveGalaxy();
  }, 1500);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

async function loadSprites() {
  const spritePaths = {
    frank: "assets/sprites/frank.png",
    letter: "assets/sprites/letter.png",
    mailbox: "assets/sprites/mailbox.png",
    max_speed: "assets/sprites/max.png",
    acceleration: "assets/sprites/acceleration.png",
    fuel_consumption: "assets/sprites/fuel.png",
    planet_1: "assets/sprites/planet_1.png",
    planet_2: "assets/sprites/planet_2.png",
    planet_3: "assets/sprites/planet_3.png",
  };

  const entries = Object.entries(spritePaths);
  for (const [key, path] of entries) {
    sprites[key] = await loadImage(path);
  }
}

export function playDmgSound() {
  const audioList = [
    new Audio("assets/audio/damage_1.mp3"),
    new Audio("assets/audio/damage_2.mp3"),
  ];
  const index = (lastDmgAudioIndex + 1) % audioList.length;
  const audio = audioList[index];
  audio.volume = 0.3;
  audio.play();
  lastDmgAudioIndex = index;
}

export const thrusterAudio = new Audio("assets/audio/thruster_2.mp3");
export const paperAudio = new Audio("assets/audio/paper.mp3");
thrusterAudio.volume = 0.1;
paperAudio.volume = 0.2;
thrusterAudio.loop = true;

await loadSprites();
drawBackgroundCanvasElement();
runGame();
