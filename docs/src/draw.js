export function createBackgroundCanvasElementMenu() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const bgCtx = canvas.getContext("2d");

  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 1.5;
    const alpha = Math.random() * 0.5 + 0.5;
    bgCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    bgCtx.beginPath();
    bgCtx.arc(x, y, radius, 0, Math.PI * 2);
    bgCtx.fill();
  }

  return canvas;
}

export function drawBackgroundMenu(ctx, backgroundCanvas) {
  const bgWidth = backgroundCanvas.width;
  const bgHeight = backgroundCanvas.height;

  const bgX = bgWidth;
  const bgY = bgHeight;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      ctx.drawImage(backgroundCanvas, bgX + x * bgWidth, bgY + y * bgHeight);
    }
  }
}

export function drawStartGame(ctx, canvas) {
  ctx.save();

  ctx.font = "32px 'Press Start 2P'";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.shadowColor = "gold";
  ctx.shadowBlur = 15;
  ctx.fillText("START GAME", centerX, centerY - 25);

  ctx.font = "22px 'Press Start 2P'";
  ctx.fillText("Press any key to start", centerX, centerY + 25);

  ctx.restore();
}

export function drawLoadingIndicator(ctx, canvas) {
  ctx.save();

  ctx.fillStyle = "#111";
  ctx.fillStyle = "white";
  ctx.font = "32px 'Press Start 2P'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "gold";
  ctx.shadowBlur = 15;
  ctx.fillText("LOADING…", canvas.width / 2, canvas.height / 2);

  ctx.restore();
}
