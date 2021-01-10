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

    const stickSize = 10;
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

    const rect = new PIXI.Graphics();
    this._rect = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      target: rect,
    };
    this._drawRect();
    this.addChild(rect);

    this._drawRect = this._drawRect.bind(this);
  }

  focused(node) {
    if (!arguments.length) {
      return this._focused;
    }

    this._focused = node;

    if (!node) {
      this._reduce();
    } else {
      this._expand();
    }

    return this;
  }

  press() {
    if (!this._focused) {
      return this;
    }

    this._expand(true);
    return this;
  }

  release() {
    if (!this._focused) {
      return this;
    }

    this._expand(false);
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

  _drawRect() {
    // if need rect
    // const { x1, y1, x2, y2, target } = this._rect;
    // const width = Math.max(x2 - x1, 0);
    // const height = Math.max(y2 - y1, 0);
    // target.clear();
    // target.lineStyle(1, 0xffffff, 0.1);
    // target.drawRect(x1 + (width && 0.5), y1 + (height && 0.5), width, height - (height && 0.5));
  }

  _expand(pressed) {
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
    const offset = pressed ? 0 : 5;

    this._lines.forEach((item, i) => {
      const [x, y] = this._linesRates[i];
      gsap.to(item.position, {
        x: x * Math.max(w2 + offset, 12),
        y: y * Math.max(h2 + offset, 12),
        duration: 0.2,
        overwrite: true,
      });
    });

    this._borders.forEach((item, i) => {
      const [x, y] = this._bordersBasePoints[i];
      gsap.to(item.position, {
        x: Math.sign(x) * -1 * Math.max(w2 + offset, 12),
        y: Math.sign(y) * -1 * Math.max(h2 + offset, 12),
        duration: 0.2,
        overwrite: true,
      });
    });

    const [[x1, y1],,[x2, y2]] = this._bordersBasePoints;
    gsap.to(this._rect, {
      x1: Math.sign(x1) * -1 * Math.max(w2 + offset, 12),
      y1: Math.sign(y1) * -1 * Math.max(h2 + offset, 12),
      x2: Math.sign(x2) * -1 * Math.max(w2 + offset, 12),
      y2: Math.sign(y2) * -1 * Math.max(h2 + offset, 12),
      duration: 0.2,
      overwrite: true,
      onUpdate: this._drawRect,
    });
  }

  _reduce() {
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

    gsap.to(this._rect, {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      duration: 0.2,
      overwrite: true,
      onUpdate: this._drawRect,
    });
  }
}

export default Locator;
