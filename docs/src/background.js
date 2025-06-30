export class Background {
  constructor(stepSize = 200) {
    this.stepSize = stepSize;
    this.tileSize = 1024;
    this.tiles = new Map(); // Keyed by `${tx},${ty}`
  }

  tileToWorld(coord) {
    return coord * this.tileSize;
  }

  getOrCreateTile(tx, ty) {
    const key = `${tx},${ty}`;
    if (this.tiles.has(key)) return this.tiles.get(key);

    const canvas = document.createElement("canvas");
    canvas.width = this.tileSize;
    canvas.height = this.tileSize;
    const ctx = canvas.getContext("2d");

    this.drawBeltsInTile(ctx, tx, ty);

    this.tiles.set(key, canvas);
    return canvas;
  }

  drawBeltsInTile(ctx, tx, ty) {
    ctx.save();

    ctx.font = "bold 48px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = "white";
    ctx.fillText(`(${0}, ${0})`, 20, this.tileSize - 20);
    ctx.strokeStyle = "red";
    ctx.strokeRect(0, 0, this.tileSize, this.tileSize);

    if (tx === 0 && ty === 0) {
      this.drawSun(ctx);
    }

    ctx.restore();
  }

  draw(ctx, cam) {
    const buffer = 2;
    const tileW = this.tileSize;
    const startTileX = Math.floor((cam.x - cam.width / 2) / tileW) - buffer;
    const endTileX = Math.floor((cam.x + cam.width / 2) / tileW) + buffer;
    const startTileY = Math.floor((cam.y - cam.height / 2) / tileW) - buffer;
    const endTileY = Math.floor((cam.y + cam.height / 2) / tileW) + buffer;

    for (let tx = startTileX; tx <= endTileX; tx++) {
      for (let ty = startTileY; ty <= endTileY; ty++) {
        const canvas = this.getOrCreateTile(tx, ty);
        const worldX = this.tileToWorld(tx);
        const worldY = this.tileToWorld(ty);
        const drawX = Math.floor(worldX - tileW / 2 - cam.x);
        const drawY = Math.floor(worldY - tileW / 2 - cam.y);
        ctx.drawImage(canvas, drawX, drawY);
      }
    }
  }

  drawSun(ctx) {
    ctx.save();

    const centerX = this.tileSize / 2;
    const centerY = this.tileSize / 2;
    const radius = this.tileSize * 0.25;

    // Outer glow — extremely subtle and wide
    const outerGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius * 4.5
    );
    outerGlow.addColorStop(0, "rgba(255, 255, 224, 0.07)");
    outerGlow.addColorStop(0.5, "rgba(255, 255, 224, 0.03)");
    outerGlow.addColorStop(1, "rgba(255, 255, 224, 0)");

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow — smooth fade, no harsh edge
    const midGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius * 2
    );
    midGlow.addColorStop(0, "rgba(255, 255, 240, 0.6)");
    midGlow.addColorStop(0.6, "rgba(255, 255, 230, 0.25)");
    midGlow.addColorStop(1, "rgba(255, 255, 224, 0)");

    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core — smoother edge transition
    const coreGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );
    coreGradient.addColorStop(0, "#ffffff");
    coreGradient.addColorStop(0.8, "#fffff0");
    coreGradient.addColorStop(1, "#ffffe0");

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
