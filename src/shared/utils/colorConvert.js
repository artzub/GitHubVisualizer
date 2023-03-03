import { color as d3color } from 'd3-color';
import * as PIXI from 'pixi.js-legacy';

const colorHash = {};
export const colorConvert = (color) => {
  let fixedColor = color || '#000';
  if (colorHash[fixedColor]) {
    return colorHash[fixedColor];
  }

  fixedColor = PIXI.utils.string2hex(d3color(fixedColor).formatHex());
  colorHash[color] = fixedColor;
  return colorHash[color];
};
