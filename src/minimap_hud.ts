import { Container, Graphics } from "pixi.js";
import { Frank } from "./frank";

export class MiniMapHUD {
  width = 150;
  height = 150;
  scale = 0.005; // Slower movement for objects
  radius = this.width / 2;
  mapContainer = new Container();
  bg = new Graphics();
  center = new Graphics();
  player = new Graphics();
  sun = new Graphics();

  constructor(container: Container, canvasWidth: number) {
    container.addChild(this.mapContainer);

    // Background + border
    this.bg.rect(0, 0, this.width, this.height);
    this.bg.fill({ color: 0x000000, alpha: 0.4 });
    this.bg.setStrokeStyle({ width: 2, color: 0xffffff });
    this.bg.rect(0, 0, this.width, this.height);
    this.mapContainer.addChild(this.bg);

    // Center marker (yellow)
    this.center.circle(0, 0, 5);
    this.center.fill(0xffff00);
    this.center.x = this.width / 2;
    this.center.y = this.height / 2;
    this.mapContainer.addChild(this.center);

    // Player marker (blue)
    this.player.circle(0, 0, 4);
    this.player.fill(0x0000ff);
    this.mapContainer.addChild(this.player);
    this.player.x = this.width / 2;
    this.player.y = this.height / 2;

    // Sun marker (orange)
    this.drawSunPolygon(this.sun, 8, 6, 3);
    this.mapContainer.addChild(this.sun);

    const margin = 40;
    this.mapContainer.x = canvasWidth - this.mapContainer.width - margin;
    this.mapContainer.y = margin;
  }

  update(frank: Frank) {
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

  drawSunPolygon(
    gfx: Graphics,
    points: number,
    outerRadius: number,
    innerRadius: number
  ) {
    const step = Math.PI / points;
    gfx.clear();
    gfx.fill(0xffaa00);
    gfx.moveTo(Math.cos(0) * outerRadius, Math.sin(0) * outerRadius);

    for (let i = 1; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step;
      gfx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }

    gfx.closePath();
  }
}
