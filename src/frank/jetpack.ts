import { Graphics } from "pixi.js";
import { audios } from "../audio";

export class FrankJetpack {
  maxFuel = 2500;
  fuel = this.maxFuel;
  fuelConsumption = 0.5;
  thrusting = false;
  flameSprite = new Graphics();
  audio = audios["thruster"];
  thrustColor = 0;

  constructor() {
    this.flameSprite.label = "frank_thruster";
  }

  setThrusting(val: boolean) {
    if (this.fuel <= 0) {
      // Turn off thrusting we don't have no fuels
      this.thrusting = false;
    } else {
      this.thrusting = val;
    }
  }

  setColor(color: number) {
    this.thrustColor = color;
  }

  resetFuel() {
    this.fuel = this.maxFuel;
  }

  damageFuelTank(fuelDamage: number) {
    this.fuel = Math.max(0, this.fuel - fuelDamage);
  }

  hasFuel() {
    return this.fuel > 0;
  }

  update(radius: number) {
    this.updateThrusterVisuals(radius);
    this.updateThrusterAudio();
    this.updateFuel();
  }

  updateThrusterVisuals(radius: number) {
    const g = this.flameSprite;
    g.clear();

    if (!this.thrusting) {
      g.visible = false;
    } else {
      g.visible = true;
      this.drawFlame(g, radius);
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

  updateFuel() {
    if (!this.thrusting) return;
    this.fuel = Math.max(0, this.fuel - this.fuelConsumption);
  }

  drawFlame(g: Graphics, radius: number) {
    const flameBase = radius * 1.2;
    const flameLength = radius * 2 + Math.random() * 40;

    const baseY = radius;
    const tipY = baseY + flameLength;

    g.fill({ color: 0xff6400, alpha: 0.4 });
    g.moveTo(-flameBase / 2, baseY);
    g.quadraticCurveTo(0, baseY + flameLength * 0.5, 0, tipY);
    g.quadraticCurveTo(0, baseY + flameLength * 0.5, flameBase / 2, baseY);
    g.closePath();

    g.fill({ color: this.thrustColor, alpha: 0.8 });
    g.circle(0, baseY + flameLength * 0.2, flameBase * 0.1);
  }
}
