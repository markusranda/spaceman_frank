import { Container, Graphics } from "pixi.js";
import { FRANK_STATE } from "./frank/const";
import { Frank } from "./frank/frank";

export class ChargeHUD {
  barBg = new Graphics();
  barFill = new Graphics();
  barWidth = 0;
  visible = false;

  constructor(
    uiContainer: Container,
    canvasWidth: number,
    canvasHeight: number
  ) {
    // Use almost full width of the screen
    const barWidth = canvasWidth * 0.9; // 90% of screen
    const barHeight = 30; // Taller bar
    const margin = 20;

    // Positioning
    const x = (canvasWidth - barWidth) / 2;
    const y = canvasHeight - barHeight - margin;

    // Background
    this.barBg = new Graphics();
    this.barBg.rect(0, 0, barWidth, barHeight);
    this.barBg.fill(0x222222); // Dark grey
    this.barBg.position.set(x, y);
    uiContainer.addChild(this.barBg);

    // Fill
    this.barFill = new Graphics();
    this.barFill.rect(0, 0, 0, barHeight);
    this.barFill.fill(0x32cd32); // Lime green
    this.barFill.position.set(x, y);
    uiContainer.addChild(this.barFill);

    this.barWidth = barWidth;

    this.setVisible(false);
  }

  update(frank: Frank) {
    if (frank.state === FRANK_STATE.preCharging) {
      if (!this.visible) this.setVisible(true);
      if (!frank.charger)
        throw Error("Can't update charge hud without frank.charger");

      const percentage =
        frank.charger.chargeUpTimer / frank.charger.getChargeUpDuration();
      const width = this.barWidth * percentage;

      // Clear previous graphics
      this.barFill.clear();
      this.barFill.rect(0, 0, width, 30);
      this.barFill.fill(0x32cd32); // Lime green
    } else {
      if (this.visible) this.setVisible(false);
    }
  }

  setVisible(isVisible: boolean) {
    this.visible = isVisible;
    this.barBg.visible = isVisible;
    this.barFill.visible = isVisible;
  }
}
