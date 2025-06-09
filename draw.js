import {
  camera,
  DAMAGE_TIMER_MAX,
  frank,
  getBackgroundCanvas,
  keys,
  level,
  mailbox,
  particles,
  planets,
  pulses,
  sprites,
  timers,
} from "./index.js";

export function drawFrank(ctx) {
  ctx.save();
  ctx.translate(frank.x - camera.x, frank.y - camera.y); // Move to Frank's position
  ctx.rotate(frank.angle + Math.PI / 2); // Rotate the canvas
  ctx.drawImage(
    frank.sprite,
    -frank.sprite.width / 2,
    -frank.sprite.height / 2
  );

  ctx.restore();
}

export function drawLetters(ctx) {
  for (const letter of level.letters) {
    ctx.save();
    ctx.translate(letter.x - camera.x, letter.y - camera.y); // Move to Frank's position
    ctx.rotate(letter.angle + Math.PI / 2); // Rotate the canvas
    ctx.drawImage(
      letter.sprite,
      -letter.sprite.width / 2, // Offset to center
      -letter.sprite.height / 2
    );

    ctx.restore();
  }
}

export function drawFlame(ctx) {
  // This action requires fuel
  if (frank.fuel <= 0) return;

  if (!keys.w) return;

  ctx.save();
  ctx.translate(frank.x - camera.x, frank.y - camera.y);
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

export function drawPlanets(ctx) {
  for (const planet of planets) {
    ctx.beginPath();
    // x, y, radius, startAngle, endAngle
    ctx.arc(
      planet.x - camera.x,
      planet.y - camera.y,
      planet.radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = planet.color;
    ctx.fill();
  }
}

export function drawMailbox(ctx) {
  ctx.save();
  ctx.translate(mailbox.x - camera.x, mailbox.y - camera.y); // Move to Frank's position
  ctx.rotate(mailbox.angle + Math.PI / 2); // Rotate the canvas
  ctx.drawImage(
    mailbox.sprite,
    -mailbox.sprite.width / 2, // Offset to center
    -mailbox.sprite.height / 2
  );

  ctx.restore();
}

export function drawLevelText(ctx, level) {
  ctx.save();

  ctx.font = "16px 'Press Start 2P'";
  ctx.fillStyle = "lime"; // CRT-style green
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillText(`Level ${level.level}`, 20, 20);

  ctx.restore();
}

export function drawLevelCleared(ctx, canvas) {
  ctx.save();

  ctx.font = "32px 'Press Start 2P'";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.shadowColor = "gold";
  ctx.shadowBlur = 15;
  ctx.fillText("LEVEL CLEARED", centerX, centerY);

  ctx.restore();
}

export function drawParticles(ctx) {
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
}

export function drawFuel(ctx) {
  const width = 40;
  const height = 80;
  let fuelHeight = height * (frank.fuel / frank.maxFuel) - 2;
  if (fuelHeight < 0) fuelHeight = 0;

  ctx.fillStyle = "grey";
  ctx.fillRect(20, 60, width, height);

  ctx.fillStyle = "lime";
  // Draw from the bottom up
  ctx.fillRect(22, 60 + height - fuelHeight - 2, width - 4, fuelHeight);
}

export function drawDamaged(ctx, canvas) {
  if (timers.damagedTimer > 0) {
    const maxAlpha = 0.4;
    const alpha = (timers.damagedTimer / DAMAGE_TIMER_MAX) * maxAlpha;
    ctx.fillStyle = `rgba(168, 50, 64, ${alpha.toFixed(3)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

export function drawLettersUI(ctx) {
  const yCord = 160;
  const sprite = sprites["letter"];
  if (!sprite) throw Error("can't draw letters without sprite");
  ctx.drawImage(sprite, 20, yCord, 40, 25);

  ctx.font = "16px 'Press Start 2P'";
  ctx.fillStyle = "lime"; // CRT-style green
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(level.letters.length, 20 + 40 + 8, yCord + 4);
}

export function drawBackground(ctx) {
  const parallax = 0.1;
  const backgroundCanvas = getBackgroundCanvas();
  const bgX = (-camera.x * parallax) % backgroundCanvas.width;
  const bgY = (-camera.y * parallax) % backgroundCanvas.height;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      ctx.drawImage(
        backgroundCanvas,
        bgX + x * backgroundCanvas.width,
        bgY + y * backgroundCanvas.height
      );
    }
  }
}

export function drawPulses(ctx) {
  for (const pulse of pulses) {
    const screenX = pulse.x - camera.x;
    const screenY = pulse.y - camera.y;

    ctx.beginPath();
    ctx.arc(screenX, screenY, pulse.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 255, 255, ${
      1 - pulse.radius / pulse.maxRadius
    })`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
