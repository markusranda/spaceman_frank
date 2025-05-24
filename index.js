import { Planet } from "./planet.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const worldX = 1200;
const worldY = 750;
canvas.width = worldX;
canvas.height = worldY;
ctx.fillRect(0, 0, worldX, worldY);

const objects = [];

function loop() {
  for (const object of objects) {
    ctx.beginPath();
    // x, y, radius, startAngle, endAngle
    ctx.arc(object.x, object.y, object.size, 0, Math.PI * 2);
    ctx.fillStyle = object.color;
    ctx.fill();
  }

  requestAnimationFrame(loop);
}

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

function createPlanet() {
  const x = Math.round(Math.random() * worldX);
  const y = Math.round(Math.random() * worldY);
  const size = randomBetween(50, 90);

  const planet = new Planet(x, y, size);
  // Ensure planet.size is set at this point
  for (const obj of objects) {
    const dx = obj.x - planet.x;
    const dy = obj.y - planet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < obj.size + planet.size) {
      // Collision: try again
      return createPlanet();
    }
  }

  return planet;
}

function runGame() {
  // Init
  for (let i = 0; i < 4; i++) {
    objects.push(createPlanet());
  }

  loop();
}

runGame();
