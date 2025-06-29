import {
  camera,
  DAMAGE_TIMER_MAX,
  frank,
  galaxy,
  gameState,
  keys,
  particles,
  timers,
  windowState,
} from "../index.js";
import { audios, playDmgSound } from "./audio.js";

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
  const { gainNode, audio, audioCtx } = audios["thruster"];
  if (!gainNode || !audio || !audioCtx)
    throw Error("Failed to find audio for thruster");

  if (frank.fuel <= 0) {
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    return;
  }

  if (keys["w"]) {
    if (audio.paused) {
      audio.play();
    }
    gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.05); // fade in
  } else {
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05); // fade out
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
