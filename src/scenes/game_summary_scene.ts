import {
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Ticker,
} from "pixi.js";
import { sprites } from "../sprites/sprites";
import { BaseScene } from "./base_scene";
import { SceneConstructor } from "../models/scene_constructor";
import { GameStats } from "../game_stats";

export class GameSummaryScene extends BaseScene {
  private backgroundContainer = new Container();
  private uiContainer = new Container();

  gameStats: GameStats;
  ticker = new Ticker();

  constructor(
    pixiApp: Application,
    onComplete: (scene: SceneConstructor) => void,
    gameStats?: GameStats
  ) {
    if (!gameStats) throw Error("No stats, no summary");
    super(pixiApp, onComplete);
    this.gameStats = gameStats;
    this.backgroundContainer.label = "background_container";
    this.uiContainer.label = "ui_container";

    document.body.appendChild(this.pixiApp.canvas);
    this.pixiApp.stage.addChild(this.backgroundContainer);
    this.pixiApp.stage.addChild(this.uiContainer);

    this.addBackground();
    this.addStatsTable(gameStats);

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

  private addStatsTable(stats: GameStats) {
    const labelValuePairs: [string, string][] = [
      ["PLANETS EATEN", `${stats.planetsEaten}`],
      ["ENEMIES EATEN", `${stats.enemiesEaten}`],
      ["FRANK SIZE", `${stats.frankSize}`],
      ["UNIVERSE RADIUS", `${Math.round(stats.universeRadius)}`],
    ];

    const itemKeys = Object.keys(stats.frankItems);

    const style = new TextStyle({
      fontFamily: "'Press Start 2P'",
      fontSize: 22,
      fill: 0xf1f1f1,
      align: "left",
      stroke: { color: 0x000000 },
    });

    const padding = 4 * 16;
    const lineHeight = 28;
    const textContainer = new Container();

    // Measure widths
    let maxLabelWidth = 0;
    let maxValueWidth = 0;

    labelValuePairs.forEach(([label, value]) => {
      const labelText = new Text({ text: `${label}:`, style });
      const valueText = new Text({ text: value, style });
      maxLabelWidth = Math.max(maxLabelWidth, labelText.width);
      maxValueWidth = Math.max(maxValueWidth, valueText.width);
    });

    const minHeight = this.pixiApp.renderer.height * 0.8;
    const minWidth = this.pixiApp.renderer.width * 0.6;

    const itemLines = itemKeys.map((key) => `- ${key}`);
    const totalLines = labelValuePairs.length + 1 + itemLines.length;

    const contentHeight = totalLines * lineHeight;
    const totalHeight = Math.max(minHeight, contentHeight + padding * 2);
    const totalWidth = Math.max(
      minWidth,
      maxLabelWidth + maxValueWidth + padding * 3
    );

    const background = new Graphics();
    background.rect(0, 0, totalWidth, totalHeight);
    background.fill({ color: 0x000000, alpha: 0.5 });
    textContainer.addChild(background);

    // Add aligned label + value pairs
    labelValuePairs.forEach(([label, value], i) => {
      const labelText = new Text({ text: `${label}:`, style });
      labelText.x = padding;
      labelText.y = padding + i * lineHeight;
      textContainer.addChild(labelText);

      const valueText = new Text({ text: value, style });
      valueText.x = totalWidth - padding - valueText.width;
      valueText.y = labelText.y;
      textContainer.addChild(valueText);
    });

    // "ITEMS COLLECTED"
    const headerY = padding + labelValuePairs.length * lineHeight;
    const itemsHeader = new Text({ text: "ITEMS COLLECTED:", style });
    itemsHeader.x = padding;
    itemsHeader.y = headerY;
    textContainer.addChild(itemsHeader);

    const valueText = new Text({ text: itemLines.length, style });
    valueText.x = totalWidth - padding - valueText.width;
    valueText.y = headerY;
    textContainer.addChild(valueText);

    // Add item lines
    itemLines.forEach((line, i) => {
      const itemText = new Text({ text: line, style });
      itemText.x = padding * 1.5;
      itemText.y = headerY + (i + 1) * lineHeight;
      textContainer.addChild(itemText);
    });

    // Position table
    textContainer.x = this.pixiApp.renderer.width / 2 - totalWidth / 2;
    textContainer.y = this.pixiApp.renderer.height / 2 - totalHeight / 2;

    this.uiContainer.addChild(textContainer);
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
