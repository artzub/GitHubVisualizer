import * as PIXI from 'pixi.js-legacy';

import { colorConvert } from './colorConvert';

const textureHash = {};
export const filledCircleTexture = (color, radius) => {
  const key = `circle_${color}`;
  if (textureHash[key]?.baseTexture) {
    return textureHash[key];
  }

  const texture = new PIXI.Graphics()
    .beginFill(colorConvert(color))
    .drawCircle(0, 0, radius)
    .generateCanvasTexture();

  textureHash[key] = texture;

  return texture;
};

export const roundedRectangularTexture = (color, width, height, radius) => {
  const key = `rect_${color}_${width}_${height}_${radius}`;
  if (textureHash[key]?.baseTexture) {
    return textureHash[key];
  }

  const texture = new PIXI.Graphics()
    .beginFill(colorConvert(color))
    .drawRoundedRect(0, 0, width, height, radius)
    .generateCanvasTexture();

  textureHash[key] = texture;

  return texture;
};
