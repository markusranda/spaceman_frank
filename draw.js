import { frank, keys, letters, mailbox, planets } from "./index.js";

export function drawFrank(ctx) {
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

export function drawLetters(ctx) {
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

export function drawFlame(ctx) {
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

export function drawPlanets(ctx) {
  for (const planet of planets) {
    ctx.beginPath();
    // x, y, radius, startAngle, endAngle
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = planet.color;
    ctx.fill();
  }
}

export function drawMailbox(ctx) {
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
