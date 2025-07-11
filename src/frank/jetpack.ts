import { Container, Graphics } from "pixi.js";
import { audios } from "../audio";
import { JetpackTrail } from "./jetpack_trail";
import { GlowFilter } from "pixi-filters";
import { SpaceItem } from "../items/space_item";

export enum JetpackMode {
  Normal = "Normal",
  TotalOverdrive = "TotalOverdrive",
}

export class FrankJetpack {
  baseMaxFuel = 2500;
  fuel = this.baseMaxFuel;
  fuelConsumption = 0.5;
  thrusting = false;
  flameGraphics = new Graphics();
  audio = audios["thruster"];
  mode: JetpackMode = JetpackMode.Normal;
  trailPoints: { x: number; y: number; alpha: number }[] = [];
  trailFadeSpeed = 0.05;
  getItems: () => Record<string, SpaceItem> = () => ({});

  trailParent: Container | null = null;
  activeTrail: JetpackTrail | null = null;
  trails: JetpackTrail[] = [];

  constructor(
    trailParent: Container,
    getItems: () => Record<string, SpaceItem>
  ) {
    this.trailParent = trailParent;
    this.flameGraphics.label = "frank_thruster";
    this.flameGraphics.filters = [
      new GlowFilter({ distance: 15, outerStrength: 2 }),
    ];
    this.getItems = getItems;
  }

  setThrusting(val: boolean) {
    if (this.fuel <= 0) {
      // Turn off thrusting we don't have no fuels
      this.thrusting = false;
    } else {
      this.thrusting = val;
    }
  }

  setMode(mode: JetpackMode) {
    this.mode = mode;
  }

  getMaxFuel() {
    let value = this.baseMaxFuel;
    for (const item of Object.values(this.getItems())) {
      value = item.modifyMaxFuel(value);
    }

    return value;
  }

  getColor() {
    const colors = {
      [JetpackMode.Normal]: 0xffff64,
      [JetpackMode.TotalOverdrive]: 0x34cceb,
    };

    return colors[this.mode];
  }

  resetFuel() {
    this.fuel = this.getMaxFuel();
  }

  damageFuelTank(fuelDamage: number) {
    this.fuel = Math.max(0, this.fuel - fuelDamage);
  }

  hasFuel() {
    return this.fuel > 0;
  }

  update(radius: number, x: number, y: number) {
    if (this.mode === JetpackMode.TotalOverdrive) {
      this.updateOverdriveVisuals(radius, x, y);
    } else {
      if (this.activeTrail) {
        this.activeTrail.startFading();
        this.activeTrail = null;
      }
      this.updateNormalVisuals(radius);
    }

    this.updateThrusterAudio();
    this.updateFuel();
    this.updateTrails();
  }

  updateNormalVisuals(radius: number) {
    const g = this.flameGraphics;
    g.clear();

    if (!this.thrusting) {
      g.visible = false;
      return;
    }

    g.visible = true;
    this.drawFlame(g, radius);
  }

  updateOverdriveVisuals(radius: number, x: number, y: number) {
    if (!this.trailParent)
      throw Error("Can't create new trail without trailParent");
    const g = this.flameGraphics;
    g.clear();

    // Start trail if we just began thrusting
    if (this.thrusting && !this.activeTrail) {
      const newTrail = new JetpackTrail(this.getColor(), radius);
      this.trails.push(newTrail);
      this.activeTrail = newTrail;

      // Make sure this gets added to cameraContainer
      const bg = this.trailParent.children.find(
        (c) => c.label === "background_container"
      );
      if (!bg) {
        throw Error(
          "Can't update jetpack visuals - failed to find background_container"
        );
      }
      const bgIndex = this.trailParent.getChildIndex(bg);
      this.trailParent.addChildAt(newTrail.graphics, bgIndex + 1);
    }

    // Add points while thrusting
    if (this.thrusting && this.activeTrail) {
      this.activeTrail.addPoint(x, y);
    }

    // End trail if thrust stopped
    if (!this.thrusting && this.activeTrail) {
      this.activeTrail.startFading();
    }

    g.visible = this.thrusting;
    if (this.thrusting) {
      // this.drawFlame(g, radius);
    }
  }

  updateThrusterAudio() {
    const { gainNode, audio, audioCtx } = this.audio;
    if (!gainNode || !audio || !audioCtx)
      throw Error("Failed to find audio for thruster");

    if (this.thrusting) {
      gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.05);
      if (audio.paused) {
        audio.play();
      }
    } else {
      gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05); // fade out
    }
  }

  updateTrailFade() {
    if (this.thrusting && this.mode === JetpackMode.TotalOverdrive) return;

    for (const point of this.trailPoints) {
      point.alpha -= this.trailFadeSpeed;
    }

    // Remove fully faded points
    this.trailPoints = this.trailPoints.filter((p) => p.alpha > 0);
  }

  updateFuel() {
    if (!this.thrusting) return;
    this.fuel = Math.max(0, this.fuel - this.fuelConsumption);
  }

  updateTrails() {
    for (const trail of this.trails) {
      trail.update();
    }

    // Remove dead trails
    this.trails = this.trails.filter((trail) => {
      const dead = trail.isDead();
      if (dead && this.trailParent?.children.includes(trail.graphics)) {
        this.trailParent.removeChild(trail.graphics);
        trail.graphics.destroy({ children: true });
      }
      return !dead;
    });
  }

  drawFlame(g: Graphics, radius: number) {
    const baseY = radius;

    // Slight flicker for each layer
    const outerFlameLength = radius * 2 + Math.random() * 40;
    const innerFlameLength = outerFlameLength * (0.6 + Math.random() * 0.2);

    const outerBase = radius * 1.2;
    const innerBase = outerBase * 0.6;

    const outerTipY = baseY + outerFlameLength;
    const innerTipY = baseY + innerFlameLength;

    // Outer flame (orange, soft)
    g.moveTo(-outerBase / 2, baseY);
    g.quadraticCurveTo(0, baseY + outerFlameLength * 0.5, 0, outerTipY);
    g.quadraticCurveTo(0, baseY + outerFlameLength * 0.5, outerBase / 2, baseY);
    g.closePath();
    g.fill({ color: 0xff6400, alpha: 0.9 });

    // Inner flame (yellow or whatever getColor() returns), hotter
    g.moveTo(-innerBase / 2, baseY);
    g.quadraticCurveTo(0, baseY + innerFlameLength * 0.5, 0, innerTipY);
    g.quadraticCurveTo(0, baseY + innerFlameLength * 0.5, innerBase / 2, baseY);
    g.closePath();
    g.fill({ color: this.getColor(), alpha: 0.9 });
  }
}
