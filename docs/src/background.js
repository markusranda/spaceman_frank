import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";

export class Background {
  sun = null;
  visualBelts = [];
  maxVisualBeltRadius = 0;

  beltThickness = 100;
  beltColor = 0x5f5;
  beltAlpha = 0.5;
  beltSpacingFactor = 3;

  pulseTime = 0;

  constructor() {
    this.sun = this.createSun();
    this.sun.x = 0;
    this.sun.y = 0;

    // Blur
    const blur = new PIXI.BlurFilter(99, 99);
    this.sun.filters = [blur];

    const glow = new PIXI.Graphics();
    glow.beginFill(0xffd200, 0.2);
    glow.drawCircle(0, 0, 100);
    glow.endFill();
    glow.blendMode = "hard-light";
    this.sun.addChild(glow);
  }

  addTo(backgroundLayer) {
    backgroundLayer.addChild(this.sun);
  }

  update(backgroundLayer, frank, screenWidth) {
    const buffer = screenWidth * 1.5;

    const frankDistance = Math.sqrt(frank.x * frank.x + frank.y * frank.y);
    const neededRadius = frankDistance + buffer;

    const spacing = frank.baseRadius * this.beltSpacingFactor;
    const base = frank.baseRadius * 4;

    while (this.maxVisualBeltRadius < neededRadius) {
      const beltIndex = this.visualBelts.length;

      const innerRadius = base + (beltIndex - 1) * spacing;
      const outerRadius = base + beltIndex * spacing;

      this.addVisualBelt(backgroundLayer, beltIndex, base, spacing);
      this.generateStars(backgroundLayer, innerRadius, outerRadius, beltIndex);

      this.maxVisualBeltRadius = outerRadius;
    }
  }

  createSun() {
    const sun = new PIXI.Container();

    const layers = [
      { radius: 65, color: "#fff", alpha: 0.4 },
      { radius: 60, color: "#fff", alpha: 1.0 },
      { radius: 55, color: "#fff", alpha: 1.0 },
      { radius: 50, color: "#fff", alpha: 1.0 },
    ];

    for (const layer of layers) {
      const circle = new PIXI.Graphics();
      circle.beginFill(layer.color, layer.alpha);
      circle.drawCircle(0, 0, layer.radius);
      circle.endFill();
      sun.addChild(circle);
    }

    return sun;
  }

  addVisualBelt(backgroundLayer, beltIndex, baseRadius, spacing) {
    const innerRadius = baseRadius + (beltIndex - 1) * spacing;
    const outerRadius = baseRadius + beltIndex * spacing;

    const t = beltIndex / 30;
    const color = this.getColorForRadius(baseRadius);
    const alpha = Math.max(0.3 - t * 0.2, 0.05);

    const belt = new PIXI.Graphics();
    belt.beginFill(color, alpha);

    const segments = 100;
    const angleStep = (Math.PI * 2) / segments;

    belt.moveTo(Math.cos(0) * outerRadius, Math.sin(0) * outerRadius);
    for (let i = 1; i <= segments; i++) {
      const angle = i * angleStep;
      belt.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    }
    for (let i = segments; i >= 0; i--) {
      const angle = i * angleStep;
      belt.lineTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
    }

    belt.endFill();

    backgroundLayer.addChild(belt);
    this.visualBelts.push(belt);
  }

  generateStars(layer, innerRadius, outerRadius, beltIndex) {
    const starCount = 30 + Math.floor(beltIndex * 2); // More stars per further belt

    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const size = Math.random() * 2 + 0.5;
      const alpha = 0.2 + Math.random() * 0.6;

      const star = new PIXI.Graphics();
      star.beginFill(0xffffff, alpha);
      star.drawCircle(0, 0, size);
      star.endFill();
      star.x = x;
      star.y = y;

      layer.addChild(star);
    }
  }

  destroy() {
    if (this.sun && this.sun.parent) {
      this.sun.parent.removeChild(this.sun);
      this.sun.destroy({ children: true });
      this.sun = null;
    }
    this.visualBelts.forEach((belt) => {
      if (belt && belt.parent) {
        belt.parent.removeChild(belt);
        belt.destroy({ children: true });
      }
    });
    this.visualBelts = [];
  }

  getColorForRadius(radius) {
    const maxRadius = 5000; // Beyond this: pure black
    const t = Math.min(radius / maxRadius, 1); // Normalize to 0..1

    const hue = 45; // Warm golden-yellow
    const saturation = 100;
    const lightness = 40 * (1 - t); // 90% lightness down to 0%

    return this.hslToHex(hue, saturation, lightness);
  }

  hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
