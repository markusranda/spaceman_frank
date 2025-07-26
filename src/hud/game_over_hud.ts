import { Container, Text, TextStyle } from "pixi.js";

export class GameOverHud {
  uiContainer: Container;
  width: number;
  height: number;
  text: Text;
  elapsed: number = 0;

  constructor(uiContainer: Container, width: number, height: number) {
    this.uiContainer = uiContainer;
    this.width = width;
    this.height = height;

    this.text = this.createGameOverText();
    this.uiContainer.addChild(this.text);
  }

  private createGameOverText(): Text {
    const style = new TextStyle({
      fontFamily: "'Press Start 2P'",
      fontSize: 128,
      fill: 0xf44f44,
      align: "center",
      stroke: { color: 0x000000 },
    });

    const text = new Text({
      text: "GAME OVER",
      style: style,
    });
    text.anchor.set(0.5);
    text.x = this.width / 2;
    text.y = this.height / 2;
    return text;
  }

  destroy() {
    this.uiContainer.removeChild(this.text);
    this.text.destroy();
  }
}
