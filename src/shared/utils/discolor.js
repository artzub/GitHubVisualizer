import { hsl } from 'd3-color';

/**
 * Discolor a color
 * @param {string|*} color - color to discolor
 * @param {number} minSaturation - minimum saturation (0...1)
 * @param {number} rate - rate of discoloration (0...1)
 * @returns {Hsl|*}
 */
export const discolor = (color, minSaturation, rate) => {
  const clampRate = Math.max(Math.min(rate || 0, 1), 0);
  if (clampRate === 0) {
    return color;
  }

  const clampSaturation = Math.max(Math.min(minSaturation || 0, 1), 0);

  const hslColor = hsl(color);
  hslColor.s = Math.max(hslColor.s * (1 - clampRate), clampSaturation);
  return hslColor;
};
