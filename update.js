import { Pulse } from "./pulse.js";
import { getDistance } from "./coords.js";
import {
  camera,
  DAMAGE_TIMER_MAX,
  frank,
  galaxy,
  gameState,
  keys,
  mailbox,
  paperAudio,
  particles,
  playDmgSound,
  pulses,
  SONAR_TIMEOUT,
  thrusterAudio,
  timers,
  windowState,
} from "./index.js";
import { playSpatialPing } from "./spatial_audio.js";

export function updateMailbox() {
  const dx = mailbox.x - frank.x;
  const dy = mailbox.y - frank.y;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq);

  if (dist <= frank.radius) {
    const foundAt = galaxy.letters.findIndex(
      (letter) => letter.id === frank.letter.id
    );
    if (foundAt > -1) galaxy.letters.splice(foundAt, 1);
    else throw Error(`Failed to find letter with id: ${frank.letter.id}`);
    frank.letter = undefined;
    frank.lettersDelivered++;
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
    for (const letter of galaxy.letters) {
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
  if (!keys["w"]) return;
  let newFuel = frank.fuel - frank.getFuelConsumption();
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
    frank.vx += Math.cos(frank.angle) * frank.getAcceleration();
    frank.vy += Math.sin(frank.angle) * frank.getAcceleration();
  }

  // === Clamp speed ===
  const speed = Math.sqrt(frank.vx ** 2 + frank.vy ** 2);
  if (speed > frank.getMaxSpeed()) {
    const scale = frank.getMaxSpeed() / speed;
    frank.vx *= scale;
    frank.vy *= scale;
  }

  // === Try X movement ===
  let blockedX = false;
  const nextX = frank.x + frank.vx;
  for (const obj of galaxy.planets) {
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
  for (const obj of galaxy.planets) {
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

  // === GRAVITY ===
  for (const planet of galaxy.planets) {
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

export function updateCamera() {
  camera.x = frank.x - camera.width / 2;
  camera.y = frank.y - camera.height / 2;
}

export function updateSonar() {
  if (timers["sonar"] <= 0 && keys[" "]) {
    let nearestLetter;
    let prevShortest = Infinity;
    for (const letter of galaxy.letters) {
      const distanceBetween = getDistance(letter.x, letter.y, frank.x, frank.y);
      if (distanceBetween < prevShortest) {
        nearestLetter = letter;
        prevShortest = distanceBetween;
      }
    }

    if (nearestLetter) {
      playSpatialPing(nearestLetter.x, nearestLetter.y, SONAR_TIMEOUT / 4);
      timers["sonar"] = SONAR_TIMEOUT;
      pulses.push(new Pulse());
    }
  }
}

export function updatePulses() {
  for (let i = pulses.length - 1; i >= 0; i--) {
    const pulse = pulses[i];
    pulse.radius += pulse.speed;

    //TODO USE THE PULSE AND LETTER COLLISION TO PLAY THE SONAR SOUND
    if (pulse.radius > pulse.maxRadius) {
      pulses.splice(i, 1);
    }
  }
}

export function updateUpgradeClicked() {
  if (windowState.lastClick) {
    for (const button of windowState.buttons) {
      if (
        windowState.lastClick.x >= button.x &&
        windowState.lastClick.x <= button.x + button.width &&
        windowState.lastClick.y >= button.y &&
        windowState.lastClick.y <= button.y + button.height
      ) {
        const { upgrade } = button;
        if (!upgrade) throw Error("What is even going on here?");

        if (!frank.upgrades[upgrade.name]) frank.upgrades[upgrade.name] = [];
        frank.upgrades[upgrade.name].push(upgrade);

        gameState.upgradeState = false;
      }
    }
    windowState.lastClick = null; // reset click
  }
}
