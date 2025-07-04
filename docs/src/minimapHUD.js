import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

export class MiniMapHUD {
  constructor(container, canvasWidth) {
    this.width = 150;
    this.height = 150;
    this.scale = 0.005; // Slower movement for objects

    this.radius = this.width / 2;

    this.mapContainer = new PIXI.Container();
    container.addChild(this.mapContainer);

    // Background + border
    this.bg = new PIXI.Graphics();
    this.bg.beginFill(0x000000, 0.4);
    this.bg.drawRect(0, 0, this.width, this.height);
    this.bg.endFill();
    this.bg.lineStyle(2, 0xffffff);
    this.bg.drawRect(0, 0, this.width, this.height);
    this.mapContainer.addChild(this.bg);

    // Center marker (yellow)
    this.center = new PIXI.Graphics();
    this.center.beginFill(0xffff00);
    this.center.drawCircle(0, 0, 5);
    this.center.endFill();
    this.center.x = this.width / 2;
    this.center.y = this.height / 2;
    this.mapContainer.addChild(this.center);

    // Player marker (blue)
    this.player = new PIXI.Graphics();
    this.player.beginFill(0x0000ff);
    this.player.drawCircle(0, 0, 4);
    this.player.endFill();
    this.mapContainer.addChild(this.player);
    this.player.x = this.width / 2;
    this.player.y = this.height / 2;

    // Sun marker (orange)
    this.sun = new PIXI.Graphics();
    this.drawSunPolygon(this.sun, 8, 6, 3);
    this.mapContainer.addChild(this.sun);

    const margin = 40;
    this.mapContainer.x = canvasWidth - this.mapContainer.width - margin;
    this.mapContainer.y = margin;
  }

  update(frank) {
    if (!frank || frank.x === undefined || frank.y === undefined)
      throw Error("Can't update minimap without my dear Frank");

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Relative position to player
    let dx = -frank.x * this.scale;
    let dy = -frank.y * this.scale;

    // Rectangular clamp
    const margin = 6; // Padding to avoid drawing over the edge
    const maxX = centerX - margin;
    const maxY = centerY - margin;

    dx = Math.max(-maxX, Math.min(maxX, dx));
    dy = Math.max(-maxY, Math.min(maxY, dy));

    this.sun.x = centerX + dx;
    this.sun.y = centerY + dy;
  }

  drawSunPolygon(gfx, points, outerRadius, innerRadius) {
    const step = Math.PI / points;
    gfx.clear();
    gfx.beginFill(0xffaa00);
    gfx.moveTo(Math.cos(0) * outerRadius, Math.sin(0) * outerRadius);

    for (let i = 1; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step;
      gfx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }

    gfx.closePath();
    gfx.endFill();
  }
}
