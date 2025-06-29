import {
  availableUpgrades,
  camera,
  DAMAGE_TIMER_MAX,
  frank,
  galaxy,
  gameState,
  getBackgroundCanvas,
  keys,
  mailbox,
  particles,
  sprites,
  timers,
  windowState,
} from "../index.js";

export function drawFrank(ctx) {
  ctx.save();
  ctx.translate(frank.x - camera.x, frank.y - camera.y);
  ctx.rotate(frank.angle + Math.PI / 2); // Rotate the canvas
  ctx.drawImage(
    frank.sprite,
    -frank.sprite.width / 2,
    -frank.sprite.height / 2
  );

  ctx.restore();
}

export function drawTheSun(ctx) {
  const radius = 400;

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // blinding white center
  gradient.addColorStop(0.3, "rgba(255, 255, 200, 0.8)"); // soft yellowish glow
  gradient.addColorStop(0.6, "rgba(255, 200, 100, 0.4)"); // fading orange
  gradient.addColorStop(1, "rgba(255, 150, 50, 0)"); // fully transparent edge

  ctx.save();
  const disFromCenter = radius / 8;
  ctx.translate(-camera.x + disFromCenter, -camera.y + disFromCenter);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawLetters(ctx) {
  for (const letter of galaxy.letters) {
    ctx.save();
    ctx.translate(letter.x - camera.x, letter.y - camera.y);
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
  for (const planet of galaxy.planets) {
    const destX = planet.x - camera.x;
    const destY = planet.y - camera.y;
    const size = 2 * planet.radius;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(destX, destY);
    ctx.rotate(planet.angle);
    ctx.shadowColor = "rgba(200,200,200,0.3)";
    ctx.shadowBlur = 40;
    ctx.drawImage(
      planet.sprite,
      -planet.radius, // offset x to center
      -planet.radius, // offset y to center
      size,
      size
    );

    ctx.restore();
  }
}

export function drawMailbox(ctx) {
  ctx.save();
  ctx.translate(mailbox.x - camera.x, mailbox.y - camera.y); // Move to Frank's position
  ctx.rotate(mailbox.angle + Math.PI / 2); // Rotate the canvas
  ctx.shadowColor = "rgba(255, 255, 128, 0.7)"; // yellowish glow
  ctx.shadowBlur = 15000;
  ctx.drawImage(
    mailbox.sprite,
    -mailbox.sprite.width / 2, // Offset to center
    -mailbox.sprite.height / 2
  );

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
  ctx.fillText("THE GALAXY IS GROWING", centerX, centerY);

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

export function drawDamaged(ctx, canvas) {
  if (timers.damagedTimer > 0) {
    const maxAlpha = 0.4;
    const alpha = (timers.damagedTimer / DAMAGE_TIMER_MAX) * maxAlpha;
    ctx.fillStyle = `rgba(168, 50, 64, ${alpha.toFixed(3)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

export function drawFuelUI(ctx) {
  const width = 40;
  const height = 80;
  let fuelHeight = height * (frank.fuel / frank.maxFuel) - 2;
  if (fuelHeight < 0) fuelHeight = 0;

  ctx.fillStyle = "grey";
  ctx.fillRect(20, 20, width, height);

  ctx.fillStyle = "lime";
  // Draw from the bottom up
  ctx.fillRect(22, 20 + height - fuelHeight - 2, width - 4, fuelHeight);
}

export function drawLettersUI(ctx) {
  const yCord = 120;
  const sprite = sprites["letter"];
  if (!sprite) throw Error("can't draw letters without sprite");
  ctx.drawImage(sprite, 20, yCord, 40, 25);

  ctx.font = "16px 'Press Start 2P'";
  ctx.fillStyle = "lime"; // CRT-style green
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(frank.lettersDelivered, 20 + 40 + 8, yCord + 4);
}

export function drawUpgradeHUD(ctx, canvas) {
  const margin = 5;
  let yCord = 160;
  const xCoordMin = canvas.width - 110;
  let xCoord = canvas.width - 110;
  for (const [name, upgrade] of Object.entries(frank.upgrades)) {
    for (let i = 0; i < upgrade.level; i++) {
      if (!upgrade.sprite)
        throw Error(`Failed to find sprite for upgrade ${name}`);
      ctx.drawImage(upgrade.sprite, xCoord + 30, yCord - 8, 40, 40);

      if (i + 1 >= upgrade.level) {
        yCord += upgrade.sprite.height + margin;
        xCoord = xCoordMin;
      } else {
        yCord += margin;
        xCoord -= margin;
      }
    }
  }
}

export function drawUpgradeUI(ctx, canvas) {
  const { width, height } = canvas;
  windowState.buttons = [];

  // Background
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "white";
  ctx.font = "32px 'Press Start 2P'";
  ctx.textAlign = "center";
  ctx.fillText("Choose Your Upgrade", width / 2, 100);

  // Buttons
  const imageTextMargin = 20;
  const buttonWidth = 200;
  const buttonHeight = 60;
  const buttonSpacing = 40;
  const totalHeight = 3 * buttonHeight + 2 * buttonSpacing;
  const startY = (height - totalHeight) / 2;
  const buttonX = (width - buttonWidth) / 2;

  ctx.font = "8px 'Press Start 2P'";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  for (let i = 0; i < availableUpgrades.length; i++) {
    const upgrade = availableUpgrades[i];
    const buttonY = startY + i * (buttonHeight + buttonSpacing);

    // Draw button
    ctx.fillStyle = "gray";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Draw label
    ctx.fillStyle = "white";
    ctx.drawImage(
      upgrade.sprite,
      buttonX + 10,
      buttonY + upgrade.sprite.height / 4
    );
    drawTextWithEllipsis(
      ctx,
      upgrade.name,
      buttonX + upgrade.sprite.width + imageTextMargin,
      buttonY + buttonHeight / 2,
      buttonWidth - upgrade.sprite.width - imageTextMargin
    );

    // Save bounds for click detection
    windowState.buttons.push({
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      upgrade: upgrade,
    });
  }
}

function drawTextWithEllipsis(ctx, text, x, y, maxWidth) {
  let truncatedText = text;
  while (
    ctx.measureText(truncatedText).width > maxWidth &&
    truncatedText.length > 0
  ) {
    truncatedText = truncatedText.slice(0, -1);
  }
  if (truncatedText.length < text.length) {
    truncatedText = truncatedText.slice(0, -1) + "…";
  }
  ctx.fillText(truncatedText, x, y);
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

export function drawSonar(ctx) {
  if (!gameState.sonarState) return;

  ctx.save();
  ctx.strokeStyle = "rgba(0, 255, 0, 0.25)";
  ctx.lineWidth = 10;
  const screenX = frank.x - camera.x;
  const screenY = frank.y - camera.y;

  ctx.beginPath();
  ctx.moveTo(screenX, screenY);
  ctx.lineTo(
    screenX + Math.cos(frank.sonarAngle) * frank.sonarRadius,
    screenY + Math.sin(frank.sonarAngle) * frank.sonarRadius
  );
  ctx.stroke();

  // Restore context state
  ctx.restore();
}

let spinAngle = 0;
export function drawCompass(ctx, canvas) {
  const origin = { x: 0, y: 0 };
  const { width } = canvas;

  // Calculate direction vector in world space
  const dx = origin.x - frank.x;
  const dy = origin.y - frank.y;

  // Calculate distance to target
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Determine angle
  let angle;
  const closeThreshold = 150; // Adjust this as needed

  if (distance < closeThreshold) {
    // Spin mode
    spinAngle += 0.1; // Control the speed of spinning
    angle = spinAngle;
  } else {
    // Normal mode
    angle = Math.atan2(dy, dx);
  }

  // Compass position (e.g. top-right)
  const compassX = width - 50; // 50 pixels from the right
  const compassY = 50; // 50 pixels from the top

  // Compass size
  const compassRadius = 30;

  // Draw compass circle
  ctx.beginPath();
  ctx.arc(compassX, compassY, compassRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw the compass needle
  const needleLength = 25;

  ctx.save(); // Save the current state
  ctx.translate(compassX, compassY); // Move to the compass center
  ctx.rotate(angle); // Rotate to point towards the target (or spin)

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(needleLength, 0);
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Optionally draw the needlehead
  ctx.beginPath();
  ctx.moveTo(needleLength, 0);
  ctx.lineTo(needleLength - 7, -5);
  ctx.lineTo(needleLength - 7, 5);
  ctx.closePath();
  ctx.fillStyle = "lime";
  ctx.fill();

  ctx.restore(); // Restore the state so other drawings aren't rotated
}
