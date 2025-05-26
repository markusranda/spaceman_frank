import {
  DAMAGE_TIMER_MAX,
  frank,
  keys,
  letters,
  mailbox,
  paperAudio,
  particles,
  planets,
  playDmgSound,
  thrusterAudio,
  timers,
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

function updateFrankFuel() {
  let newFuel = frank.fuel - frank.fuelConsumption;
  if (newFuel < 0) frank.fuel = 0;
  else frank.fuel = newFuel;
}

function updateFrankCrash(collisions) {
  const impactThreshold = 1.5;
  const fuelLossMultiplier = 10;

  const alreadyChecked = new Set();

  for (const obj of collisions) {
    if (alreadyChecked.has(obj)) continue;
    alreadyChecked.add(obj);

    // Use predicted position before the collision was blocked
    const nextX = frank.x + frank.vx;
    const nextY = frank.y + frank.vy;

    const dx = nextX - obj.x;
    const dy = nextY - obj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) continue;

    const nx = dx / dist;
    const ny = dy / dist;

    // Project velocity onto normal
    const normalVelocity = frank.vx * nx + frank.vy * ny;

    const impactSpeed = Math.abs(normalVelocity); // direction doesn't matter — magnitude does

    if (impactSpeed > impactThreshold) {
      const fuelLoss = impactSpeed * fuelLossMultiplier;
      frank.fuel = Math.max(0, frank.fuel - fuelLoss);
      timers.damagedTimer = DAMAGE_TIMER_MAX;
      playDmgSound();
      console.log(
        `CRASH: Speed ${impactSpeed.toFixed(2)} → -${fuelLoss.toFixed(
          1
        )} fuel on ${obj.name ?? "[unnamed]"}`
      );
    }
  }
}

function updateFrankMovement() {
  const hasFuel = frank.fuel > 0;
  const collisions = [];

  // === ROTATION ===
  if (keys.a) frank.angle -= frank.rotationSpeed;
  if (keys.d) frank.angle += frank.rotationSpeed;

  // === THRUST ===
  if (hasFuel && keys.w) {
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
      collisions.push(obj);
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
      collisions.push(obj);
    }
  }

  if (collisions.length > 0) {
    updateFrankCrash(collisions);
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

export function updateFrank() {
  updateFrankFuel();
  updateFrankMovement();
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
  // This action requires fuel
  if (frank.fuel <= 0) {
    thrusterAudio.pause();
    return;
  }

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

export function updateTimers(delta) {
  for (const [key, val] of Object.entries(timers)) {
    if (val !== undefined && val > 0) {
      const newValue = val - delta;
      timers[key] = newValue > 0 ? newValue : 0;
    }
  }
}
