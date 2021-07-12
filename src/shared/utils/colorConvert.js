import { color as d3color } from 'd3-color';
import * as PIXI from 'pixi.js-legacy';

export const colorConvert = (color) => PIXI.utils.string2hex(d3color(color || '#000').formatHex());
