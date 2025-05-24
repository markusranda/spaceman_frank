import { Frank } from "./frank.js";
import { createPlanet } from "./planet.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const worldX = 1200;
const worldY = 900;
canvas.width = worldX;
canvas.height = worldY;
const frank = new Frank(50, 50);
const objects = [];

const keys = {
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
  // Rotate
  if (keys.a) frank.angle -= frank.rotationSpeed;
  if (keys.d) frank.angle += frank.rotationSpeed;

  // Thrust forward/backward
  if (keys.w) {
    frank.vx += Math.cos(frank.angle) * frank.acceleration;
    frank.vy += Math.sin(frank.angle) * frank.acceleration;
  }

  // Clamp speed
  const speed = Math.sqrt(frank.vx ** 2 + frank.vy ** 2);
  if (speed > frank.maxSpeed) {
    const scale = frank.maxSpeed / speed;
    frank.vx *= scale;
    frank.vy *= scale;
  }

  // Update position
  frank.x += frank.vx;
  frank.y += frank.vy;

  // Apply friction (so he slows down if no key is pressed)
  frank.vx *= frank.friction;
  frank.vy *= frank.friction;
}

function drawFrank() {
  ctx.save();
  ctx.translate(frank.x, frank.y); // Move to Frank's position
  ctx.rotate(frank.angle + Math.PI / 2); // Rotate the canvas
  ctx.drawImage(
    frank.sprite,
    -frank.sprite.width / 2, // Offset to center
    -frank.sprite.height / 2
  );

  ctx.restore();
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, worldX, worldY);
  for (const object of objects) {
    ctx.beginPath();
    // x, y, radius, startAngle, endAngle
    ctx.arc(object.x, object.y, object.size, 0, Math.PI * 2);
    ctx.fillStyle = object.color;
    ctx.fill();
  }

  drawFrank();
}

function loop() {
  update();
  draw();

  requestAnimationFrame(loop);
}

function runGame() {
  // Init
  for (let i = 0; i < 4; i++) {
    objects.push(createPlanet(worldX, worldY, objects));
  }

  loop();
}

frank.sprite.onload = () => {
  runGame();
};
