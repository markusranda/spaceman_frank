import {
  camera,
  DAMAGE_TIMER_MAX,
  frank,
  galaxy,
  gameState,
  keys,
  particles,
  SPAWN_TIMER_MAX,
  timers,
  windowState,
} from "../index.js";
import { audios, playDmgSound, playEatSound } from "./audio.js";
import { Enemy, MAX_ATTACK_TIMER } from "./enemy.js";
import { Projectile } from "./projectile.js";

function updateFrankFuel() {
  if (!keys["w"]) return;
  let newFuel = frank.fuel - frank.getFuelConsumption();
  if (newFuel < 0) frank.fuel = 0;
  else frank.fuel = newFuel;
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

  // === MOVE ===
  frank.x += frank.vx;
  frank.y += frank.vy;

  // === COLLISIONS ===
  const collisions = {};
  collisions["planet"] = detectCollisions(galaxy.planets);
  collisions["enemy"] = detectCollisions(galaxy.enemies);
  const projectiles = detectCollisions(galaxy.projectiles);
  handleEdibleCollisions(collisions);
  handleProjectileCollisions(projectiles);
}

function detectCollisions(objects) {
  // index => object
  const collisions = {};

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    const dx = frank.x - obj.x;
    const dy = frank.y - obj.y;
    const dist = Math.hypot(dx, dy);
    const minDist = frank.radius + obj.radius;
    if (dist < minDist) {
      collisions[i] = obj;
    }
  }

  return collisions;
}

function handleEdibleCollisions(objects) {
  const maxEdibleRadius = frank.radius * 0.75;
  const impactThreshold = 1.5;
  const fuelLossMultiplier = 10;

  for (const [type, mapByIndex] of Object.entries(objects)) {
    for (const [index, obj] of Object.entries(mapByIndex)) {
      const dx = frank.x + frank.vx - obj.x;
      const dy = frank.y + frank.vy - obj.y;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) continue;

      const nx = dx / dist;
      const ny = dy / dist;
      const normalVelocity = frank.vx * nx + frank.vy * ny;
      const impactSpeed = Math.abs(normalVelocity);

      const isEdible = obj.radius <= maxEdibleRadius;

      if (isEdible) {
        removeFromGalaxy(type, index);
        frank.eatEntity(obj);
        playEatSound();
      } else {
        if (impactSpeed > impactThreshold) {
          frank.fuel = Math.max(
            0,
            frank.fuel - impactSpeed * fuelLossMultiplier
          );
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
}

function handleProjectileCollisions(projectiles) {
  for (const [index, projectile] of Object.entries(projectiles)) {
    frank.fuel -= projectile.damage;

    timers.damagedTimer = DAMAGE_TIMER_MAX;

    galaxy.projectiles.splice(index, 1);
  }
}

function removeFromGalaxy(type, objIndex) {
  if (type === "planet") {
    galaxy.planets.splice(objIndex, 1);
  } else if (type === "enemy") {
    galaxy.enemies.splice(objIndex, 1);
  }
}

export function updateFrank() {
  updateFrankFuel();
  updateFrankMovement();
}

export function updateSpawnEnemies() {
  if (timers.spawnTimer <= 0 && galaxy.enemies.length < galaxy.enemyMaxCount) {
    try {
      galaxy.enemies.push(new Enemy(frank, galaxy));
    } catch (e) {
      console.error(e);
    } finally {
      timers.spawnTimer = SPAWN_TIMER_MAX;
    }
  }
}

export function updateEnemies(delta) {
  const sweetSpot = 400;

  for (const enemy of galaxy.enemies) {
    const dx = frank.x - enemy.x;
    const dy = frank.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) continue;

    // Move toward or away from Frank to reach the sweet spot
    let moveDir = 0;
    if (dist > sweetSpot + 10) moveDir = 1; // too far, move closer
    else if (dist < sweetSpot - 10) moveDir = -1; // too close, back off
    // else: stay put

    const stepX = (dx / dist) * enemy.speed * moveDir;
    const stepY = (dy / dist) * enemy.speed * moveDir;

    enemy.x += stepX;
    enemy.y += stepY;

    if (enemy.attackTimer <= 0 && enemy.attackRange >= dist) {
      const angle = Math.atan2(frank.y - enemy.y, frank.x - enemy.x);
      galaxy.projectiles.push(new Projectile(enemy.x, enemy.y, angle));
      enemy.attackTimer = MAX_ATTACK_TIMER;
    }

    enemy.attackTimer -= delta;
  }
}

export function updateProjectiles(delta) {
  for (let i = galaxy.projectiles.length - 1; i >= 0; i--) {
    const projectile = galaxy.projectiles[i];
    const speed = projectile.speed;
    projectile.x += Math.cos(projectile.angle) * speed;
    projectile.y += Math.sin(projectile.angle) * speed;

    if (projectile.ttl <= 0) {
      galaxy.projectiles.splice(i, 1);
    } else {
      projectile.ttl -= delta;
    }
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
