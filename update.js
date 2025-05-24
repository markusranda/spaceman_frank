import {
  frank,
  keys,
  letters,
  mailbox,
  paperAudio,
  particles,
  planets,
  thrusterAudio,
  worldX,
  worldY,
} from "./index.js";

export function updateMailbox() {
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
    paperAudio.play();
  }
}

export function updateLetters() {
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

export function updateFrank() {
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
}

export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;

    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function updateThrusterAudio() {
  if (keys["w"]) {
    const isPlaying =
      !thrusterAudio.paused &&
      !thrusterAudio.ended &&
      thrusterAudio.currentTime > 0;
    if (!isPlaying) thrusterAudio.play();
  } else {
    thrusterAudio.pause();
    thrusterAudio.currentTime = 0;
  }
}
