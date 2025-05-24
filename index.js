import { Frank } from "./frank.js";
import { createLetter } from "./letter.js";
import { createPlanet } from "./planet.js";
import { createMailbox } from "./mailbox.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const worldX = 1200;
const worldY = 900;
canvas.width = worldX;
canvas.height = worldY;
const frank = new Frank(50, 50);
const planets = [];
const letters = [];
let mailbox = undefined;

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

function handleMailboxCollision() {
  const dx = mailbox.x - frank.x;
  const dy = mailbox.y - frank.y;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq);

  if (dist <= frank.radius) {
    const foundAt = letters.findIndex(
      (letter) => letter.id === frank.letter.id
    );
    if (foundAt > -1) letters.splice(foundAt, 1);
    else throw Error(`Failed to find letter with id: ${frank.letter.id}`);
    frank.letter = undefined;
  }
}

function handleLetterCollision() {
  const foreheadOffset = 40;

  if (frank.letter) {
    frank.letter.x = frank.x + Math.cos(frank.angle) * foreheadOffset;
    frank.letter.y = frank.y + Math.sin(frank.angle) * foreheadOffset;
    frank.letter.angle = frank.angle;
  } else {
    for (const letter of letters) {
      const dx = letter.x - frank.x;
      const dy = letter.y - frank.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      if (dist <= frank.radius) {
        frank.letter = letter;
        letter.x = frank.x + Math.cos(frank.angle) * foreheadOffset;
        letter.y = frank.y + Math.sin(frank.angle) * foreheadOffset;
        letter.angle = frank.angle;
      }
    }
  }
}

function update() {
  // === ROTATION ===
  if (keys.a) frank.angle -= frank.rotationSpeed;
  if (keys.d) frank.angle += frank.rotationSpeed;

  // === THRUST ===
  if (keys.w) {
    frank.vx += Math.cos(frank.angle) * frank.acceleration;
    frank.vy += Math.sin(frank.angle) * frank.acceleration;
  }

  // === Clamp speed ===
  const speed = Math.sqrt(frank.vx ** 2 + frank.vy ** 2);
  if (speed > frank.maxSpeed) {
    const scale = frank.maxSpeed / speed;
    frank.vx *= scale;
    frank.vy *= scale;
  }

  // === Try X movement ===
  let blockedX = false;
  const nextX = frank.x + frank.vx;
  for (const obj of planets) {
    const dx = nextX - obj.x;
    const dy = frank.y - obj.y; // Y remains unchanged
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < frank.radius + obj.radius) {
      blockedX = true;
      break;
    }
  }

  if (!blockedX) frank.x = nextX;
  else frank.vx = 0;

  // === Try Y movement ===
  let blockedY = false;
  const nextY = frank.y + frank.vy;
  for (const obj of planets) {
    const dx = frank.x - obj.x; // X is updated from above
    const dy = nextY - obj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < frank.radius + obj.radius) {
      blockedY = true;
      break;
    }
  }

  if (!blockedY) frank.y = nextY;
  else frank.vy = 0;

  // === World bounds ===
  if (frank.x < 1 || frank.x > worldX) frank.vx = 0;
  if (frank.y < 1 || frank.y > worldY) frank.vy = 0;

  // === Friction ===
  if (!keys.w) {
    frank.vx *= frank.friction;
    frank.vy *= frank.friction;
  }

  // === GRAVITY ===
  for (const planet of planets) {
    const dx = planet.x - frank.x;
    const dy = planet.y - frank.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist === 0) continue;

    const gravityStrength = 0.03;
    const falloff = Math.exp(-dist / 100);

    const force = gravityStrength * falloff;

    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    frank.vx += fx;
    frank.vy += fy;
  }

  handleLetterCollision();
  if (frank.letter) handleMailboxCollision();
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

function drawLetters() {
  for (const letter of letters) {
    ctx.save();
    ctx.translate(letter.x, letter.y); // Move to Frank's position
    ctx.rotate(letter.angle + Math.PI / 2); // Rotate the canvas
    ctx.drawImage(
      letter.sprite,
      -letter.sprite.width / 2, // Offset to center
      -letter.sprite.height / 2
    );

    ctx.restore();
  }
}

function drawFlame() {
  if (!keys.w) return;

  ctx.save();
  ctx.translate(frank.x, frank.y);
  ctx.rotate(frank.angle + Math.PI / 2);

  const flameBase = frank.sprite.width * 0.6;
  const flameLength = 30 + Math.random() * 20;
  const baseCurve = 6; // how "rounded" the base is

  const gradient = ctx.createLinearGradient(
    0,
    frank.sprite.height / 2,
    0,
    frank.sprite.height / 2 + flameLength
  );
  gradient.addColorStop(0, "white");
  gradient.addColorStop(0.3, "yellow");
  gradient.addColorStop(0.7, "orange");
  gradient.addColorStop(1, "red");

  ctx.beginPath();

  // Rounded base
  ctx.moveTo(-flameBase / 2, frank.sprite.height / 2);
  ctx.lineTo(-flameBase / 2 + baseCurve, frank.sprite.height / 2 - baseCurve);

  // Left side curve to tip
  ctx.lineTo(-flameBase * 0.2, frank.sprite.height / 2 + flameLength * 0.5);

  // Tip
  ctx.lineTo(0, frank.sprite.height / 2 + flameLength);

  // Right side curve
  ctx.lineTo(flameBase * 0.2, frank.sprite.height / 2 + flameLength * 0.5);

  // Rounded base other side
  ctx.lineTo(flameBase / 2 - baseCurve, frank.sprite.height / 2 - baseCurve);
  ctx.lineTo(flameBase / 2, frank.sprite.height / 2);

  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();
}

function drawPlanets() {
  for (const planet of planets) {
    ctx.beginPath();
    // x, y, radius, startAngle, endAngle
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = planet.color;
    ctx.fill();
  }
}

function drawMailbox() {
  ctx.save();
  ctx.translate(mailbox.x, mailbox.y); // Move to Frank's position
  ctx.rotate(mailbox.angle + Math.PI / 2); // Rotate the canvas
  ctx.drawImage(
    mailbox.sprite,
    -mailbox.sprite.width / 2, // Offset to center
    -mailbox.sprite.height / 2
  );

  ctx.restore();
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, worldX, worldY);

  drawMailbox();
  drawFrank();
  drawLetters();
  drawPlanets();
  drawFlame();
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
