import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";
import { FRANK_STATE } from "./frankstate.js";
import { FRANK_CHARGE_TIMER_MAX } from "./timers.js";

export class ChargeHUD {
  constructor(uiContainer, canvasWidth, canvasHeight) {
    // Use almost full width of the screen
    const barWidth = canvasWidth * 0.9; // 90% of screen
    const barHeight = 30; // Taller bar
    const margin = 20;

    // Positioning
    const x = (canvasWidth - barWidth) / 2;
    const y = canvasHeight - barHeight - margin;

    // Background
    this.barBg = new PIXI.Graphics();
    this.barBg.beginFill(0x222222); // Dark grey
    this.barBg.drawRect(0, 0, barWidth, barHeight);
    this.barBg.endFill();
    this.barBg.position.set(x, y);
    uiContainer.addChild(this.barBg);

    // Fill
    this.barFill = new PIXI.Graphics();
    this.barFill.beginFill(0x32cd32); // Lime green
    this.barFill.drawRect(0, 0, 0, barHeight);
    this.barFill.endFill();
    this.barFill.position.set(x, y);
    uiContainer.addChild(this.barFill);

    this.barWidth = barWidth;
    this.visible = false;

    this.setVisible(false);
  }

  update(frank) {
    if (frank.state === FRANK_STATE.PRE_CHARGING) {
      if (!this.visible) this.setVisible(true);

      const percentage = frank.chargeTimer / FRANK_CHARGE_TIMER_MAX;
      const width = this.barWidth * percentage;

      // Clear previous graphics
      this.barFill.clear();
      this.barFill.beginFill(0x32cd32); // Lime green
      this.barFill.drawRect(0, 0, width, 30);
      this.barFill.endFill();
    } else {
      if (this.visible) this.setVisible(false);
    }
  }

  setVisible(isVisible) {
    this.visible = isVisible;
    this.barBg.visible = isVisible;
    this.barFill.visible = isVisible;
  }
}
