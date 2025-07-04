import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.10.2/dist/pixi.min.mjs";
import { DAMAGE_TIMER_MAX } from "./timers.js";
import { GAME_STATES } from "./gamestate.js";
import { MiniMapHUD } from "./minimapHUD.js";

export class GameHUD {
  levelClearedText;
  damageOverlay;
  frankSizeText;
  fuelBarBg;
  fuelBarFill;
  fullnessBarBg;
  fullnessBarFill;

  constructor(uiContainer, canvasWidth, canvasHeight) {
    this.uiContainer = uiContainer;

    // --- Level Cleared Text ---
    this.levelClearedText = new PIXI.Text({
      text: "FRANK GROWS HUNGRIER",
      style: new PIXI.TextStyle({
        fontFamily: "'Press Start 2P'",
        fontSize: 32,
        fill: 0xffffff,
        align: "center",
        stroke: { color: 0x000000, thickness: 2 },
      }),
    });
    this.levelClearedText.name = "level_cleared_text";
    this.levelClearedText.anchor.x = 0.5;
    this.levelClearedText.anchor.y = 0.5;
    this.levelClearedText.x = canvasWidth / 2;
    this.levelClearedText.y = 100;
    this.levelClearedText.visible = false;

    // --- Damage Overlay ---
    this.damageOverlay = new PIXI.Graphics();
    this.levelClearedText.name = "damage_overlay";
    this.damageOverlay.rect(0, 0, canvasWidth, canvasHeight);
    this.damageOverlay.fill({ color: 0xa83240, alpha: 0.5 });
    this.damageOverlay.visible = true;

    // --- Frank Size UI ---
    this.frankSizeText = new PIXI.Text({
      text: "0m",
      style: new PIXI.TextStyle({
        fontFamily: "'Press Start 2P'",
        fontSize: 32,
        fill: 0x00ff00,
        align: "center",
        stroke: { color: 0x000000, thickness: 2 },
      }),
    });
    this.frankSizeText.name = "frank_size_text";
    this.frankSizeText.anchor.set(0.5);
    this.frankSizeText.x = canvasWidth / 2;
    this.frankSizeText.y = 40;

    // --- Fuel UI ---
    const fuelWidth = 40;
    const fuelHeight = 80;
    const fuelPosX = 20;
    const fuelPosY = 20;

    this.fuelBarBg = new PIXI.Graphics();
    this.fuelBarBg.name = "fuel_bar_bg";
    this.fuelBarBg.rect(fuelPosX, fuelPosY, fuelWidth, fuelHeight);
    this.fuelBarBg.fill(0x808080);

    this.fuelBarFill = new PIXI.Graphics();
    this.fuelBarFill.name = "fuel_bar_fill";

    // --- Fullness UI ---
    const fullnessWidth = 40;
    const fullnessHeight = 80;
    const fullnessPosX = 20;
    const fullnessPosY = 120;

    this.fullnessBarBg = new PIXI.Graphics();
    this.fullnessBarBg.name = "fullness_bar_bg";
    this.fullnessBarBg.rect(
      fullnessPosX,
      fullnessPosY,
      fullnessWidth,
      fullnessHeight
    );
    this.fullnessBarBg.fill(0x808080);

    this.fullnessBarFill = new PIXI.Graphics();
    this.fullnessBarFill.name = "fullness_bar_fill";

    // HUD
    this.uiContainer.addChild(this.fuelBarBg);
    this.uiContainer.addChild(this.fuelBarFill);
    this.uiContainer.addChild(this.fullnessBarBg);
    this.uiContainer.addChild(this.fullnessBarFill);

    // HUD Messages
    this.uiContainer.addChild(this.frankSizeText);
    this.uiContainer.addChild(this.levelClearedText);

    // Overlay over everything
    this.uiContainer.addChild(this.damageOverlay);

    this.minimapHUD = new MiniMapHUD(this.uiContainer, canvasWidth);
  }

  update(frank, timers, gameState) {
    this.updateLevelCleared(gameState);
    this.updateDamageOverlay(timers);
    this.updateFrankSizeUI(frank);
    this.updateFuelUI(frank);
    this.updateFullnessUI(frank);
    this.minimapHUD.update(frank);
  }

  updateLevelCleared(gameState) {
    this.levelClearedText.visible = gameState === GAME_STATES.VICTORY;
  }

  updateDamageOverlay(timers) {
    if (timers.damageTimer > 0) {
      const maxAlpha = 0.5;
      const alpha = (timers.damageTimer / DAMAGE_TIMER_MAX) * maxAlpha;
      this.damageOverlay.alpha = alpha;
      this.damageOverlay.visible = true;
    } else {
      this.damageOverlay.visible = false;
      this.damageOverlay.alpha = 0;
    }
  }

  updateFrankSizeUI(frank) {
    this.frankSizeText.text = `${Math.floor(frank.radius)}m`;
  }

  updateFuelUI(frank) {
    const fuelWidth = 40;
    const fuelHeight = 80;
    const fuelPosX = 20;
    const fuelPosY = 20;
    let fuelFillHeight = fuelHeight * (frank.fuel / frank.maxFuel) - 2;
    if (fuelFillHeight < 0) fuelFillHeight = 0;

    this.fuelBarFill.clear();
    this.fuelBarFill.rect(
      fuelPosX + 2,
      fuelPosY + fuelHeight - fuelFillHeight - 2,
      fuelWidth - 4,
      fuelFillHeight
    );
    this.fuelBarFill.fill(0x00ff00);
  }

  updateFullnessUI(frank) {
    const fullnessWidth = 40;
    const fullnessHeight = 80;
    const fullnessPosX = 20;
    const fullnessPosY = 120;
    let fullnessFillHeight =
      fullnessHeight * (frank.fullness / frank.getFullnessGoal()) - 2;
    if (fullnessFillHeight < 0) fullnessFillHeight = 0;

    this.fullnessBarFill.clear();
    this.fullnessBarFill.rect(
      fullnessPosX + 2,
      fullnessPosY + fullnessHeight - fullnessFillHeight - 2,
      fullnessWidth - 4,
      fullnessFillHeight
    );
    this.fullnessBarFill.fill(0xffc0cb);
  }
}
