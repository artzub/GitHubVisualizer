import { drawDashedPolygon } from '@/shared/graphics/drawDashedPolygon';
import * as PIXI from 'pixijs';
import gsap from 'gsap';

const duration = 0.1;

const defaultOptions = {
  cross: true,
  lines: true,
  rect: false,
  dots: false,
};

class Cursor extends PIXI.Container {
  constructor(options = defaultOptions) {
    super();

    this.onPointerMove = this.onPointerMove.bind(this);

    this._linesRates = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
    ];

    this._options = {
      ...defaultOptions,
      ...options,
    };

    if (this._options.lines) {
      this._lines = new Array(4)
        .fill(false)
        .map((_, i) => {
          const item = new PIXI.Graphics();
          const [x, y] = this._linesRates[i];
          item.x = x * 12;
          item.y = y * 12;
          item.name = `locator_line_${i + 1}`;
          return item;
        });
      this.addChild(...this._lines);
    }

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

    if (this._options.cross) {
      this._borders = new Array(4)
        .fill(false)
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

    if (this._options.dots) {
      this._dots = new Array(4)
        .fill(false)
        .map((_, i) => {
          const item = new PIXI.Graphics();
          let [x, y] = this._linesRates[i];
          item.x = x * 12;
          item.y = y * 12;
          item.name = `locator_dots_${i + 1}`;
          item.lineStyle(1, 0xffffff, 1);
          const ySign = Math.sign(y);
          x = x !== 0 ? 0 : 4;
          y = y !== 0 ? 0 : 4;
          item.moveTo(x ? -x + 0.5 : 0.5, y ? -y - 0.5 : ySign * 0.5);
          item.lineTo(x ? x + 0.5 : 0.5, y ? y - 0.5 : ySign * 0.5);

          return item;
        });
      this.addChild(...this._dots);
    }

    if (this._options.rect) {
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
  }

  focusOn(node) {
    if (!arguments.length) {
      return this._focused;
    }

    this._focused = node;

    if (!node) {
      this._reduce();
    } else {
      this.show();
      this._expand();
    }

    return this;
  }

  press() {
    if (!this._focused) {
      return this;
    }

    this._pressed = true;
    this._expand();
    return this;
  }

  release() {
    if (!this._focused) {
      return this;
    }

    this._pressed = false;
    this._expand();
    return this;
  }

  resize(width, height) {
    if (!this._lines) {
      return;
    }

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

  show() {
    gsap.to(this, {
      alpha: 1,
      duration,
      overwrite: true,
    });
  }

  hide() {
    gsap.to(this, {
      alpha: 0,
      duration,
      overwrite: true,
    });
  }

  _drawRect() {
    if (!this._rect) {
      return;
    }

    const { x1, y1, x2, y2, target } = this._rect;
    const width = Math.max(x2 - x1, 0);
    const height = Math.max(y2 - y1, 0);
    target.clear();
    target.lineStyle(1, 0xffffff, 0.2);
    target.drawRect(x1 + (width && 0.5), y1 + (height && 0.5), width, height - (height && 0.5));
  }

  _expand() {
    const { width, height } = this._focused.getLocalBounds();

    const pos = this._focused.getGlobalPosition(undefined, true);

    gsap.to(this.position, {
      x: pos.x,
      y: pos.y,
      duration,
      overwrite: true,
    });

    const w2 = width * 0.5;
    const h2 = height * 0.5;
    const offset = this._pressed ? 0 : 5;

    if (this._lines) {
      this._lines.forEach((item, i) => {
        const [x, y] = this._linesRates[i];
        gsap.to(item.position, {
          x: x * Math.max(w2 + offset, 12),
          y: y * Math.max(h2 + offset, 12),
          duration,
          overwrite: true,
        });
      });
    }

    if (this._dots) {
      this._dots.forEach((item, i) => {
        const [x, y] = this._linesRates[i];
        gsap.to(item.position, {
          x: x * Math.max(w2 + offset, 12),
          y: y * Math.max(h2 + offset, 12),
          duration,
          overwrite: true,
        });
      });
    }

    if (this._borders) {
      this._borders.forEach((item, i) => {
        const [x, y] = this._bordersBasePoints[i];
        gsap.to(item.position, {
          x: Math.sign(x) * -1 * Math.max(w2 + offset, 12),
          y: Math.sign(y) * -1 * Math.max(h2 + offset, 12),
          duration,
          overwrite: true,
        });
      });
    }

    if (this._rect) {
      const [[x1, y1], , [x2, y2]] = this._bordersBasePoints;
      gsap.to(this._rect, {
        x1: Math.sign(x1) * -1 * Math.max(w2 + offset, 12),
        y1: Math.sign(y1) * -1 * Math.max(h2 + offset, 12),
        x2: Math.sign(x2) * -1 * Math.max(w2 + offset, 12),
        y2: Math.sign(y2) * -1 * Math.max(h2 + offset, 12),
        duration,
        overwrite: true,
        onUpdate: this._drawRect,
      });
    }
  }

  _reduce() {
    if (this._lines) {
      this._lines.forEach((item, i) => {
        const [x, y] = this._linesRates[i];
        gsap.to(item.position, {
          x: x * 12,
          y: y * 12,
          duration,
          overwrite: true,
        });
      });
    }

    if (this._dots) {
      this._dots.forEach((item, i) => {
        const [x, y] = this._linesRates[i];
        gsap.to(item.position, {
          x: x * 12,
          y: y * 12,
          duration,
          overwrite: true,
        });
      });
    }

    if (this._borders) {
      this._borders.forEach((item, i) => {
        const [x, y] = this._bordersBasePoints[i];
        gsap.to(item.position, {
          x,
          y,
          duration,
          overwrite: true,
        });
      });
    }

    if (this._rect) {
      gsap.to(this._rect, {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        duration,
        overwrite: true,
        onUpdate: this._drawRect,
      });
    }
  }
}

export default Cursor;
