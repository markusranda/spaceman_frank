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
  thrusterAudio,
  thrusterAudioCtx,
  thrusterGainNode,
  timers,
  windowState,
} from "../index.js";
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

function handlePlanetCollision(planets) {
  const impactThreshold = 1.5;
  const fuelLossMultiplier = 10;
  const maxEdibleRadius = frank.radius * 0.75;

  const alreadyChecked = new Set();

  for (const planet of planets) {
    if (alreadyChecked.has(planet)) continue;
    alreadyChecked.add(planet);

    const nextX = frank.x + frank.vx;
    const nextY = frank.y + frank.vy;

    const dx = nextX - planet.x;
    const dy = nextY - planet.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) continue;

    const nx = dx / dist;
    const ny = dy / dist;

    const normalVelocity = frank.vx * nx + frank.vy * ny;
    const impactSpeed = Math.abs(normalVelocity);

    if (planet.radius <= maxEdibleRadius) {
      const index = galaxy.planets.indexOf(planet);
      if (index !== -1) {
        galaxy.planets.splice(index, 1);
        frank.eatPlanet(planet);
      }
    } else {
      if (impactSpeed > impactThreshold) {
        const fuelLoss = impactSpeed * fuelLossMultiplier;
        frank.fuel = Math.max(0, frank.fuel - fuelLoss);
        timers.damagedTimer = DAMAGE_TIMER_MAX;
        playDmgSound();
      }

      if (normalVelocity < 0) {
        frank.vx -= normalVelocity * nx;
        frank.vy -= normalVelocity * ny;
      }
    }
  }
}

export function updateFrankMovement() {
  const hasFuel = frank.fuel > 0;

  // === ROTATION ===
  if (keys.a) frank.angle -= frank.rotationSpeed;
  if (keys.d) frank.angle += frank.rotationSpeed;

  // === THRUST ===
  if (hasFuel && keys.w) {
    const accel = frank.getAcceleration();
    frank.vx += Math.cos(frank.angle) * accel;
    frank.vy += Math.sin(frank.angle) * accel;
  }

  // === Clamp speed ===
  const speed = Math.hypot(frank.vx, frank.vy);
  const maxSpeed = frank.getMaxSpeed();
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    frank.vx *= scale;
    frank.vy *= scale;
  }

  // === MOVE Frank ===
  frank.x += frank.vx;
  frank.y += frank.vy;

  // === COLLISION ===
  const planetCollisions = [];
  for (const planet of galaxy.planets) {
    const dx = frank.x - planet.x;
    const dy = frank.y - planet.y;
    const dist = Math.hypot(dx, dy);
    const minDist = frank.radius + planet.radius;

    if (dist < minDist) {
      planetCollisions.push(planet);
    }
  }

  if (planetCollisions.length > 0) {
    handlePlanetCollision(planetCollisions);
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
  if (frank.fuel <= 0) {
    thrusterGainNode.gain.setTargetAtTime(
      0,
      thrusterAudioCtx.currentTime,
      0.05
    );
    return;
  }

  if (keys["w"]) {
    if (thrusterAudio.paused) {
      thrusterAudio.play();
    }
    thrusterGainNode.gain.setTargetAtTime(
      1,
      thrusterAudioCtx.currentTime,
      0.05
    ); // fade in
  } else {
    thrusterGainNode.gain.setTargetAtTime(
      0,
      thrusterAudioCtx.currentTime,
      0.05
    ); // fade out
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
  if (keys[" "] && !gameState.sonarState) {
    gameState.sonarState = true;
  }

  if (gameState.sonarState) {
    frank.sonarAngle -= 0.01;

    for (const letter of galaxy.letters) {
      if (frank.sonarLetters.has(letter.id)) continue;
      if (frank.letter?.id === letter.id) continue;

      const dx = letter.x - frank.x;
      const dy = letter.y - frank.y;
      const letterAngle = Math.atan2(dy, dx);

      // Calculate the absolute angle difference
      let diff = Math.abs(letterAngle - frank.sonarAngle);

      // Wrap angle to [0, 2π]
      if (diff > Math.PI) {
        diff = 2 * Math.PI - diff;
      }

      // Check if letter is within the radar beam
      const sweepWidth = 0.05; // adjust this angle as needed (in radians)
      if (diff < sweepWidth) {
        frank.sonarLetters.add(letter.id);
        playSpatialPing(letter.x, letter.y, 200);
      }
    }
  }

  if (frank.sonarAngle <= -2 * Math.PI) {
    gameState.sonarState = false;
    frank.sonarAngle = 0;
    frank.sonarLetters.clear();
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

        if (!frank.upgrades[upgrade.name])
          frank.upgrades[upgrade.name] = upgrade;
        else frank.upgrades[upgrade.name].level++;

        gameState.upgradeState = false;
      }
    }
    windowState.lastClick = null; // reset click
  }
}

export function updatePlanets() {
  for (const planet of galaxy.planets) {
    planet.angle += 0.0001;
  }
}
