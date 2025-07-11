export async function getAlphaBounds(path: string) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw Error("couldn't get context");
        ctx.drawImage(image, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let minX = canvas.width,
          minY = canvas.height,
          maxX = 0,
          maxY = 0;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4 + 3;
            if (data[i] > 0) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (minX > maxX || minY > maxY)
          resolve({ x: 0, y: 0, width: 0, height: 0 });
        else
          resolve({
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
          });
      };
      image.onerror = reject;
      image.src = path;
    } catch (error) {
      throw Error(`Failed to get alpha bounds - ${error}`);
    }
  });
}
