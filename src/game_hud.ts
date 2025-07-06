import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { DAMAGE_TIMER_MAX } from "./timers";
import { GAME_STATES } from "./gamestate";
import { MiniMapHUD } from "./minimap_hud";
import { ChargeHUD } from "./charge_hud";
import { Frank } from "./frank/frank";
import { SpaceTimers } from "./space_timers";

export class GameHUD {
  levelClearedText = new Text();
  damageOverlay = new Graphics();
  frankSizeText = new Text();
  fuelBarBg = new Graphics();
  fuelBarFill = new Graphics();
  fullnessBarBg = new Graphics();
  fullnessBarFill = new Graphics();
  minimapHUD: MiniMapHUD | null = null;
  chargeHUD: ChargeHUD | null = null;

  constructor(
    uiContainer: Container,
    canvasWidth: number,
    canvasHeight: number
  ) {
    // --- Level Cleared Text ---
    this.levelClearedText = new Text({
      text: "FRANK GROWS HUNGRIER",
      style: new TextStyle({
        fontFamily: "'Press Start 2P'",
        fontSize: 32,
        fill: 0xffffff,
        align: "center",
        stroke: { color: 0x000000 },
      }),
    });
    this.levelClearedText.label = "level_cleared_text";
    this.levelClearedText.anchor.x = 0.5;
    this.levelClearedText.anchor.y = 0.5;
    this.levelClearedText.x = canvasWidth / 2;
    this.levelClearedText.y = 100;
    this.levelClearedText.visible = false;

    // --- Damage Overlay ---
    this.damageOverlay = new Graphics();
    this.levelClearedText.label = "damage_overlay";
    this.damageOverlay.rect(0, 0, canvasWidth, canvasHeight);
    this.damageOverlay.fill({ color: 0xa83240, alpha: 0.5 });
    this.damageOverlay.visible = true;

    // --- Frank Size UI ---
    this.frankSizeText = new Text({
      text: "0m",
      style: new TextStyle({
        fontFamily: "'Press Start 2P'",
        fontSize: 32,
        fill: 0x00ff00,
        align: "center",
        stroke: { color: 0x000000 },
      }),
    });
    this.frankSizeText.label = "frank_size_text";
    this.frankSizeText.anchor.set(0.5);
    this.frankSizeText.x = canvasWidth / 2;
    this.frankSizeText.y = 40;

    // --- Fuel UI ---
    const fuelWidth = 40;
    const fuelHeight = 80;
    const fuelPosX = 20;
    const fuelPosY = 20;

    this.fuelBarBg = new Graphics();
    this.fuelBarBg.label = "fuel_bar_bg";
    this.fuelBarBg.rect(fuelPosX, fuelPosY, fuelWidth, fuelHeight);
    this.fuelBarBg.fill(0x808080);

    this.fuelBarFill = new Graphics();
    this.fuelBarFill.label = "fuel_bar_fill";

    // --- Fullness UI ---
    const fullnessWidth = 40;
    const fullnessHeight = 80;
    const fullnessPosX = 20;
    const fullnessPosY = 120;

    this.fullnessBarBg = new Graphics();
    this.fullnessBarBg.label = "fullness_bar_bg";
    this.fullnessBarBg.rect(
      fullnessPosX,
      fullnessPosY,
      fullnessWidth,
      fullnessHeight
    );
    this.fullnessBarBg.fill(0x808080);

    this.fullnessBarFill = new Graphics();
    this.fullnessBarFill.label = "fullness_bar_fill";

    // HUD
    uiContainer.addChild(this.fuelBarBg);
    uiContainer.addChild(this.fuelBarFill);
    uiContainer.addChild(this.fullnessBarBg);
    uiContainer.addChild(this.fullnessBarFill);

    // HUD Messages
    uiContainer.addChild(this.frankSizeText);
    uiContainer.addChild(this.levelClearedText);

    // Overlay over everything
    uiContainer.addChild(this.damageOverlay);

    this.minimapHUD = new MiniMapHUD(uiContainer, canvasWidth);
    this.chargeHUD = new ChargeHUD(uiContainer, canvasWidth, canvasHeight);
  }

  update(frank: Frank, timers: SpaceTimers, gameState: number) {
    if (!this.minimapHUD)
      throw Error("Can't update game hud without minimap hud");
    if (!this.chargeHUD)
      throw Error("Can't update game hud without charge hud");

    this.updateLevelCleared(gameState);
    this.updateDamageOverlay(timers);
    this.updateFrankSizeUI(frank);
    this.updateFuelUI(frank);
    this.updateFullnessUI(frank);
    this.minimapHUD.update(frank);
    this.chargeHUD.update(frank);
  }

  updateLevelCleared(gameState: number) {
    this.levelClearedText.visible = gameState === GAME_STATES.VICTORY;
  }

  updateDamageOverlay(timers: SpaceTimers) {
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

  updateFrankSizeUI(frank: Frank) {
    this.frankSizeText.text = `${Math.floor(frank.radius)}m`;
  }

  updateFuelUI(frank: Frank) {
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

  updateFullnessUI(frank: Frank) {
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
