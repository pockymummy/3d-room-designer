import type { Page } from '@playwright/test';

/** The colour panel overlays the left of the canvas; measurements skip it. */
const PANEL_WIDTH = 320;

export interface PixelStats {
  distinct: number;
  blue: number;
  green: number;
}

/** Screenshot of the canvas area to the right of the colour panel. */
export async function captureScene(page: Page): Promise<Buffer> {
  const { width, height } = page.viewportSize()!;
  return page.screenshot({ clip: { x: PANEL_WIDTH, y: 0, width: width - PANEL_WIDTH, height } });
}

/**
 * Counts dominant-channel pixels in a PNG. The PNG is decoded in the browser
 * so no image library is needed. The scene is lit and shaded, so "dominant"
 * (one channel clearly above the others) is used instead of exact colours.
 */
export async function pixelStats(page: Page, png: Buffer): Promise<PixelStats> {
  return page.evaluate(async (base64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = new Set<number>();
    let blue = 0;
    let green = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      colors.add((r << 16) | (g << 8) | b);
      if (b > r + 30 && b > g + 30) blue++;
      if (g > r + 30 && g > b + 30) green++;
    }
    return { distinct: colors.size, blue, green };
  }, png.toString('base64'));
}

export async function sceneStats(page: Page): Promise<PixelStats> {
  return pixelStats(page, await captureScene(page));
}
