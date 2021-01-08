import * as PIXI from 'pixijs';
import gsap from 'gsap';
import { drawDashedPolygon } from '../shared/drawDashedPolygon';

class Locator extends PIXI.Container {
  constructor() {
    super();

    this.onPointerMove = this.onPointerMove.bind(this);

    this._linesRates = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
    ];
    this._lines = new Array(4).fill(null).map((_, i) => {
      const item = new PIXI.Graphics();
      const [x, y] = this._linesRates[i];
      item.x = x * 12;
      item.y = y * 12;
      item.name = `locator_line_${i + 1}`;
      return item;
    });
    this.addChild(...this._lines);

    const stickSize = 9;
    let points = [
      [stickSize, 0, 0.5, 0, 0.5, stickSize],
      [0.5, stickSize, 0.5, 0, -stickSize + 0.5, 0],
      [-stickSize + 0.5, 0, 0.5, 0, 0.5, -stickSize],
      [0.5, -stickSize, 0.5, 0, stickSize, 0],
    ];
    this._bordersBasePoints = [
      [1, 0.5],
      [-1, 0.5],
      [-1, -1.5],
      [1, -1.5],
    ];
    this._borders = new Array(4)
      .fill(null)
      .map((_, i) => {
        const item = new PIXI.Graphics();
        item.roundPixels = true;
        item.lineStyle(1, 0xffffff, 1);

        const [mx, my, x1, y1, x2, y2] = points[i];

        item.moveTo(mx, my);
        item.lineTo(x1, y1);
        item.lineTo(x2, y2);

        const [sx, sy] = this._bordersBasePoints[i];

        item.x = sx;
        item.y = sy;

        item.name = `locator_border_${i + 1}`;

        return item;
      });
    this.addChild(...this._borders);
  }

  focused(node) {
    if (!arguments.length) {
      return this._focused;
    }

    this._focused = node;

    if (!node) {
      this._stopAnimation();
    } else {
      this._startAnimation();
    }

    return this;
  }

  resize(width, height) {
    this._lines.forEach((item, i) => {
      item.clear();
      item.roundPixels = true;
      item.lineStyle(1, 0xffffff, 0.2);
      const points = [
        {
          x: 0.5,
          y: -0.5,
        },
        {
          x: i % 2 && (i === 3 ? 1 : -1) * width * 3,
          y: i % 2 ? 0 : (i === 2 ? 1 : -1) * height * 3,
        },
      ];
      drawDashedPolygon(item, points, 0, 0, 0, 6, 18, 0);
      const line = new PIXI.Graphics();
      line.lineStyle(1, 0xffffff, 1);
      let { x, y } = points[1];
      const xSign = Math.sign(x);
      const ySign = Math.sign(y);
      x = x !== 0 ? 0 : 1.5;
      y = y !== 0 ? 0 : 1.5;
      line.moveTo(x ? -x + 0.5 : xSign * 0.5, y ? -y - 0.5 : ySign * 0.5);
      line.lineTo(x + 0.5 + xSign * 0.5, y - 0.5 + ySign * 0.5);

      // if needed dots
      // item.addChild(line);
    });
  }

  onPointerMove(event) {
    if ((this._focused && event?.currentTarget !== this._focused) || !event?.data?.global) {
      return;
    }

    const { x, y } = event.data.global;
    this.x = x;
    this.y = y;
  }

  _startAnimation() {
    const { width, height } = this._focused.getLocalBounds();

    const pos = this._focused.getGlobalPosition(undefined, true);

    gsap.to(this.position, {
      x: pos.x,
      y: pos.y,
      duration: 0.2,
      overwrite: true,
    });

    const w2 = width * 0.5;
    const h2 = height * 0.5;

    this._lines.forEach((item, i) => {
      const [x, y] = this._linesRates[i];
      gsap.to(item.position, {
        x: x * Math.max(w2 + 4, 12),
        y: y * Math.max(h2 + 4, 12),
        duration: 0.2,
        overwrite: true,
      });
    });

    this._borders.forEach((item, i) => {
      const [x, y] = this._bordersBasePoints[i];
      gsap.to(item.position, {
        x: Math.sign(x) * -1 * Math.max(w2 + 4, 12),
        y: Math.sign(y) * -1 * Math.max(h2 + 4, 12),
        duration: 0.2,
        overwrite: true,
      });
    });
  }

  _stopAnimation() {
    this._lines.forEach((item, i) => {
      const [x, y] = this._linesRates[i];
      gsap.to(item.position, {
        x: x * 12,
        y: y * 12,
        duration: 0.2,
        overwrite: true,
      });
    });

    this._borders.forEach((item, i) => {
      const [x, y] = this._bordersBasePoints[i];
      gsap.to(item.position, {
        x,
        y,
        duration: 0.2,
        overwrite: true,
      });
    });
  }
}

export default Locator;
