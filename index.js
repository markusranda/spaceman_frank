import { Frank } from "./frank.js";
import { createLetter } from "./letter.js";
import { createPlanet } from "./planet.js";
import { createMailbox } from "./mailbox.js";
import {
  drawDamaged,
  drawFlame,
  drawFrank,
  drawFuel,
  drawLetters,
  drawLevelCleared,
  drawLevelText,
  drawMailbox,
  drawParticles,
  drawPlanets,
} from "./draw.js";
import {
  updateFrank,
  updateLetters,
  updateMailbox,
  updateParticles,
  updateThrusterAudio,
  updateTimers,
} from "./update.js";

const body = document.getElementById("rootElement");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
export const worldX = body.clientWidth;
export const worldY = body.clientHeight;
canvas.width = worldX;
canvas.height = worldY;

// State
export const sprites = {};
export let frank = undefined;
export let planets = [];
export let letters = [];
export let mailbox = undefined;
export let particles = [];
export const timers = {
  damagedTimer: 0,
};
export const DAMAGE_TIMER_MAX = 1000;

let frameId = 0;
let level = 0;
let victory = false;
let lastTime = 0;
let lastDmgAudioIndex = 0;

export const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
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

function update(delta) {
  if (letters.length < 1 && !victory) nextLevel();

  updateThrusterAudio();
  updateFrank();
  updateLetters();
  updateParticles();
  if (frank.letter) updateMailbox();
  updateTimers(delta);
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, worldX, worldY);

  drawMailbox(ctx);
  drawFrank(ctx);
  drawLetters(ctx);
  drawPlanets(ctx);
  drawFlame(ctx);
  drawLevelText(ctx, level);
  if (victory) {
    drawParticles(ctx);
    drawLevelCleared(ctx, canvas);
  }
  drawFuel(ctx);
  drawDamaged(ctx, canvas);
}

function loop(currentTime, currentLevel) {
  // Clear old loop
  if (currentLevel !== level) return;
  const delta = currentTime - lastTime;

  update(delta);
  draw();

  lastTime = currentTime;
  frameId = requestAnimationFrame((newTime) => loop(newTime, currentLevel));
}

function runGame() {
  // Reset state completely
  cancelAnimationFrame(frameId);

  // Reset world
  frank = new Frank(worldX / 2, worldY / 2);
  planets = [];
  letters = [];
  particles = [];
  mailbox = undefined;
  victory = false;

  // Spawn stuff
  for (let i = 0; i < 4 + level; i++) {
    const planet = createPlanet(worldX, worldY, planets);
    if (planet) planets.push(planet);
  }
  for (let i = 0; i < 1 + level; i++) {
    const letter = createLetter(worldX, worldY, planets);
    if (letter) letters.push(letter);
  }
  if (letters.length < 1)
    throw Error("No letters were created, game failed to be created");
  mailbox = createMailbox(worldX, worldY, planets);

  // Run
  frameId = requestAnimationFrame(() => loop(0, level));
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

function nextLevel() {
  victory = true;
  spawnVictoryParticles();

  setTimeout(() => {
    level++;
    runGame();
  }, 1000);
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
    frank: "sprites/frank.png",
    letter: "sprites/letter.png",
    mailbox: "sprites/mailbox.png",
  };

  const entries = Object.entries(spritePaths);
  for (const [key, path] of entries) {
    sprites[key] = await loadImage(path);
  }
}

export function playDmgSound() {
  const audioList = [new Audio("damage_1.mp3"), new Audio("damage_2.mp3")];
  const index = (lastDmgAudioIndex + 1) % audioList.length;
  const audio = audioList[index];
  audio.volume = 0.3;
  audio.play();
  lastDmgAudioIndex = index;
}

export const thrusterAudio = new Audio("thruster_2.mp3");
export const paperAudio = new Audio("paper.mp3");
thrusterAudio.volume = 0.1;
paperAudio.volume = 0.2;
thrusterAudio.loop = true;
const song = new Audio("spaceman_frank_1.mp3");
song.volume = 0.05;
song.play();

await loadSprites();
runGame();
