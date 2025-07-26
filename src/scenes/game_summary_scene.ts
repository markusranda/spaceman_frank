import {
  Application,
  Container,
  Sprite,
  Text,
  TextStyle,
  Ticker,
} from "pixi.js";
import { sprites } from "../sprites/sprites";
import { BaseScene } from "./base_scene";
import { SceneConstructor } from "../models/scene_constructor";

export class GameSummaryScene extends BaseScene {
  private backgroundContainer = new Container();
  private uiContainer = new Container();
  private centerText = new Text();
  private helperText = new Text();

  textBlinkPhase = 0;
  ticker = new Ticker();

  constructor(
    pixiApp: Application,
    onComplete: (scene: SceneConstructor) => void
  ) {
    super(pixiApp, onComplete);
    this.backgroundContainer.label = "background_container";
    this.uiContainer.label = "ui_container";

    document.body.appendChild(this.pixiApp.canvas);
    this.pixiApp.stage.addChild(this.backgroundContainer);
    this.pixiApp.stage.addChild(this.uiContainer);

    this.setCenterText("This game is unfortunately over..");
    this.uiContainer.addChild(this.centerText);
    this.uiContainer.addChild(this.helperText);

    this.addBackground();

    this.update = this.update.bind(this);
    this.ticker.add(this.update);
    this.ticker.minFPS = 60;
    this.ticker.start();
  }

  private update() {}

  public destroy() {
    this.backgroundContainer.destroy({ children: true });
    this.uiContainer.destroy({ children: true });
  }

  updateCenterText(ticker: Ticker) {
    const speed = 0.004;
    const change = speed * ticker.deltaMS;
    this.textBlinkPhase = (this.textBlinkPhase + change) % (Math.PI * 2);
    this.centerText.alpha = 0.5 + 0.5 * Math.sin(this.textBlinkPhase);
    const minAlpha = 0.3;
    const maxAlpha = 1.0;
    const range = (maxAlpha - minAlpha) / 2;
    const mid = minAlpha + range;

    this.centerText.alpha = mid + range * Math.sin(this.textBlinkPhase);
  }

  private setCenterText(text: string) {
    this.centerText.style = new TextStyle({
      fontFamily: "'Press Start 2P'",
      fontSize: 22,
      fill: 0xf1f1f1,
      align: "center",
      stroke: { color: 0x000000 },
    });

    this.centerText.text = text;

    this.centerText.x =
      this.pixiApp.renderer.width / 2 - this.centerText.width / 2;
    this.centerText.y = this.pixiApp.renderer.height / 2;
  }

  private addBackground() {
    const bgTexture = new Sprite(sprites["starfield_1"]).texture;

    const maxWidth = this.pixiApp.renderer.width;
    const maxHeight = this.pixiApp.renderer.height;

    for (let x = 0; x <= maxWidth; x += bgTexture.width) {
      for (let y = 0; y <= maxHeight; y += bgTexture.height) {
        const sprite = new Sprite(bgTexture);
        sprite.x = x;
        sprite.y = y;
        this.backgroundContainer.addChild(sprite);
      }
    }
  }
}
