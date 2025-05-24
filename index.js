import { Frank } from "./frank.js";
import { createLetter } from "./letter.js";
import { createPlanet } from "./planet.js";
import { createMailbox } from "./mailbox.js";
import {
  drawFlame,
  drawFrank,
  drawLetters,
  drawMailbox,
  drawPlanets,
} from "./draw.js";
import { updateFrank, updateLetters, updateMailbox } from "./update.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
export const worldX = 1200;
export const worldY = 900;
canvas.width = worldX;
canvas.height = worldY;

// State
export let frank = new Frank(50, 50);
export let planets = [];
export let letters = [];
export let mailbox = undefined;
let frameId = 0;
let level = 0;

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

function update() {
  if (letters.length < 1) nextLevel();

  updateFrank();
  updateLetters();
  if (frank.letter) updateMailbox();
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, worldX, worldY);

  drawMailbox(ctx);
  drawFrank(ctx);
  drawLetters(ctx);
  drawPlanets(ctx);
  drawFlame(ctx);
}

function loop(currentLevel) {
  // Clear old loop
  if (currentLevel !== level) return;
  update();
  draw();
  frameId = requestAnimationFrame(() => loop(currentLevel));
}

function runGame() {
  // Reset state completely
  cancelAnimationFrame(frameId);

  // Reset world
  frank = new Frank(50, 50);
  planets = [];
  letters = [];
  mailbox = undefined;

  // Init
  for (let i = 0; i < 4 + level; i++) {
    planets.push(createPlanet(worldX, worldY, planets));
  }
  for (let i = 0; i < 2 + level; i++) {
    letters.push(createLetter(worldX, worldY, planets));
  }
  mailbox = createMailbox(worldX, worldY, planets);

  frameId = requestAnimationFrame(() => loop(level));
}

function nextLevel() {
  level++;
  runGame();
}

runGame();
