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
export const frank = new Frank(50, 50);
export const planets = [];
export const letters = [];
export let mailbox = undefined;

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

function loop() {
  update();
  draw();

  requestAnimationFrame(loop);
}

function runGame() {
  // Init
  for (let i = 0; i < 4; i++) {
    planets.push(createPlanet(worldX, worldY, planets));
  }
  for (let i = 0; i < 2; i++) {
    letters.push(createLetter(worldX, worldY, planets));
  }
  mailbox = createMailbox(worldX, worldY, planets);

  loop();
}

frank.sprite.onload = () => {
  runGame();
};
