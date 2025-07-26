import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { DAMAGE_TIMER_MAX } from "../timers";
import { GAME_STATES } from "../gamestate";
import { MiniMapHUD } from "./minimap_hud";
import { ChargeHUD } from "../charge_hud";
import { Frank } from "../frank/frank";
import { SpaceTimers } from "../space_timers";
import { StomachHud } from "./stomach_hud";
import { FuelHud } from "./fuel_hud";
import { ItemsHud } from "./items_hud";

export class GameHUD {
  levelClearedText = new Text();
  damageOverlay = new Graphics();
  frankSizeText = new Text();
  fuelBarBg = new Graphics();
  fuelBarFill = new Graphics();
  minimapHUD: MiniMapHUD | null = null;
  chargeHUD: ChargeHUD | null = null;
  fuelHud = new FuelHud(20, 40);
  stomachHud = new StomachHud(20, 130);
  itemsHud = new ItemsHud(140, 60);

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

    // HUD
    uiContainer.addChild(this.fuelHud.container);
    uiContainer.addChild(this.stomachHud.container);
    uiContainer.addChild(this.itemsHud.container);

    // HUD Messages
    uiContainer.addChild(this.frankSizeText);
    uiContainer.addChild(this.levelClearedText);

    // Overlay over everything
    uiContainer.addChild(this.damageOverlay);

    this.minimapHUD = new MiniMapHUD(uiContainer, canvasWidth);
    this.chargeHUD = new ChargeHUD(uiContainer, canvasWidth, canvasHeight);
  }

  update(frank: Frank, timers: SpaceTimers, gameState: string) {
    if (!this.minimapHUD)
      throw Error("Can't update game hud without minimap hud");
    if (!this.chargeHUD)
      throw Error("Can't update game hud without charge hud");

    this.updateLevelCleared(gameState);
    this.updateDamageOverlay(timers);
    this.updateFrankSizeUI(frank);
    this.fuelHud.update(frank);
    this.stomachHud.update(frank);
    this.minimapHUD.update(frank);
    this.chargeHUD.update(frank);
    this.itemsHud.update(frank);
  }

  updateLevelCleared(gameState: string) {
    this.levelClearedText.visible = gameState === GAME_STATES.victory;
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
}
