export const sprites = {};

export async function loadSprites() {
  const spritePaths = {
    frank: "assets/sprites/frank.png",
    max_speed: "assets/sprites/max.png",
    acceleration: "assets/sprites/acceleration.png",
    fuel_consumption: "assets/sprites/fuel.png",
    planet_1: "assets/sprites/planet_1.png",
    planet_2: "assets/sprites/planet_2.png",
    planet_3: "assets/sprites/planet_3.png",
    enemy_1: "assets/sprites/enemy_1.png",
  };

  const entries = Object.entries(spritePaths);
  for (const [key, path] of entries) {
    sprites[key] = await loadImage(path);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}
