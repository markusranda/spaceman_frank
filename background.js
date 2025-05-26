import { setBackgroundCanvas } from "./index.js";

export function drawBackgroundCanvasElement() {
  const backgroundCanvas = document.createElement("canvas");
  backgroundCanvas.width = 2048;
  backgroundCanvas.height = 2048;
  const bgCtx = backgroundCanvas.getContext("2d");

  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * backgroundCanvas.width;
    const y = Math.random() * backgroundCanvas.height;
    const radius = Math.random() * 1.5;
    const alpha = Math.random() * 0.5 + 0.5;
    bgCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    bgCtx.beginPath();
    bgCtx.arc(x, y, radius, 0, Math.PI * 2);
    bgCtx.fill();
  }

  setBackgroundCanvas(backgroundCanvas);
}
