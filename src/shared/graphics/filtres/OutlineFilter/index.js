import * as PIXI from 'pixi.js-legacy';

import fragment from './fragment.js';
import vertex from './vertex.js';

// TODO remove after migration to pixi v7

/**
 * OutlineFilter
 * original: https://github.com/pixijs/filters/blob/v5.2.0/filters/outline/src/OutlineFilter.ts
 *
 * @class OutlineFilter
 * @extends {PIXI.Filter}
 */
class OutlineFilter extends PIXI.Filter {
  static MIN_SAMPLES = 1;
  static MAX_SAMPLES = 100;

  _thickness = 1;
  _alpha = 1.0;
  _knockout = false;

  /**
   * @param {number} [thickness=1] - The tickness of the outline. Make it 2 times more for resolution 2
   * @param {number} [color=0x000000] - The color of the outline.
   * @param {number} [quality=0.1] - The quality of the outline from `0` to `1`, using a higher quality
   *        setting will result in slower performance and more accuracy.
   * @param {number} [alpha=1.0] - The alpha of the outline.
   * @param {boolean} [knockout=false] - Only render outline, not the contents.
   */
  constructor(thickness = 1, color = 0x000000, quality = 0.1, alpha = 1.0, knockout = false)
  {
    super(vertex, fragment.replace(/\{\{angleStep\}\}/, OutlineFilter.getAngleStep(quality)));

    this.uniforms.uThickness = new Float32Array([0, 0]);
    this.uniforms.uColor = new Float32Array([0, 0, 0, 1]);
    this.uniforms.uAlpha = alpha;
    this.uniforms.uKnockout = knockout;

    Object.assign(this, { thickness, color, quality, alpha, knockout });
  }

  /**
   * Get the angleStep by quality
   * @private
   * @param {number} quality - The quality of the outline from `0` to `1`
   * @return {string} angleStep
   */
  static getAngleStep(quality) {
    const samples = Math.max(
      quality * OutlineFilter.MAX_SAMPLES,
      OutlineFilter.MIN_SAMPLES,
    );

    return (Math.PI * 2 / samples).toFixed(7);
  }

  apply(filterManager, input, output, clear) {
    this.uniforms.uThickness[0] = this._thickness / input._frame.width;
    this.uniforms.uThickness[1] = this._thickness / input._frame.height;
    this.uniforms.uAlpha = this._alpha;
    this.uniforms.uKnockout = this._knockout;

    filterManager.applyFilter(this, input, output, clear);
  }

  /**
   * The alpha of the outline.
   * @default 1.0
   */
  get alpha() {
    return this._alpha;
  }
  set alpha(value) {
    this._alpha = value;
  }

  /**
   * The color of the outline.
   * @default 0x000000
   */
  get color() {
    return PIXI.utils.rgb2hex(this.uniforms.uColor);
  }
  set color(value) {
    PIXI.utils.hex2rgb(value, this.uniforms.uColor);
  }

  /**
   * Only render outline, not the contents.
   * @default false
   */
  get knockout() {
    return this._knockout;
  }
  set knockout(value) {
    this._knockout = value;
  }

  /**
   * The thickness of the outline.
   * @default 1
   */
  get thickness() {
    return this._thickness;
  }
  set thickness(value) {
    this._thickness = value;
    this.padding = value;
  }
}

export { OutlineFilter };
