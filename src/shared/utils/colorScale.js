import { scaleOrdinal } from 'd3-scale';
import * as PIXI from 'pixi.js-legacy';

import * as palettes from '@mui/material/colors';

//d3.scaleSequential(d3.interpolateRainbow)
const colorIndexes = [100, 200, 300, 500, 600, 700];
const ignoreColors = ['common', 'grey', 'brown'];

export const colorsPalette = Object.entries(palettes)
  .filter(([key]) => !ignoreColors.includes(key))
  .reduce((acc, [, palette]) => [
    ...acc,
    ...colorIndexes.map((key) => PIXI.utils.string2hex(palette[key])),
  ], [])
  .sort()
  .map((item) => PIXI.utils.hex2string(item))
;

export const colorScale = (palette = colorsPalette) => scaleOrdinal(palette);
