import { select } from 'd3-selection';
import * as PIXI from 'pixi.js-legacy';

import { hasTransition } from '@/shared/utils';

import { drawDashedPolygon } from './drawDashedPolygon';

const duration = 100;

const defaultOptions = {
  cross: true,
  lines: true,
  rect: false,
  dots: false,
};

const bindGraphic = (graphic) => function () {
  this.graphic = graphic;
};

const updatePosition = function () {
  const graphic = this.graphic;
  const attrs = this.attributes;
  graphic.x = +attrs.x.value;
  graphic.y = +attrs.y.value;
};

const drawRect = function () {
  const graphic = this.graphic;
  const attrs = this.attributes;
  const x0 = +attrs.x0.value;
  const y0 = +attrs.y0.value;
  const x1 = +attrs.x1.value;
  const y1 = +attrs.y1.value;

  const width = Math.max(x1 - x0, 0);
  const height = Math.max(y1 - y0, 0);

  graphic.clear();
  graphic.lineStyle(1, 0xffffff, 0.2);
  graphic.drawRect(x0 + (width && 0.5), y0 + (height && 0.5), width, height - (height && 0.5));
};

export class Cursor extends PIXI.Container {
  constructor(options = defaultOptions) {
    super();

    this._shadow = select(document.createElement('shadow'));

    this._shadowMain = this._shadow
      .append('shadow')
      .attr('class', 'main')
      .attr('x', 0)
      .attr('y', 0)
      .attr('opacity', 1)
      .each(bindGraphic(this));

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
      const lines = [];
      this._shadowLines = this._shadow
        .selectAll('.line')
        .data(this._linesRates)
        .enter()
        .append('shadow')
        .attr('class', 'line')
        .attr('id', (d, i) => `locator_line_${i + 1}`)
        .attr('x', (d) => d[0] * 12)
        .attr('y', (d) => d[1] * 12)
        .each(function () {
          this.graphic = new PIXI.Graphics();
          lines.push(this.graphic);
        });
      this._lines = lines;
      this.addChild(...lines);
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
      const borders = [];
      this._shadowBorders = this._shadow
        .selectAll('.border')
        .data(this._bordersBasePoints)
        .enter()
        .append('shadow')
        .attr('class', 'border')
        .attr('id', (d, i) => `locator_border_${i + 1}`)
        .attr('x', (d) => d[0])
        .attr('y', (d) => d[1])
        .each(function (d, i) {
          const item = new PIXI.Graphics();
          item.roundPixels = true;
          item.lineStyle(1, 0xffffff, 1);

          const [mx, my, x1, y1, x2, y2] = points[i];

          item.moveTo(mx, my);
          item.lineTo(x1, y1);
          item.lineTo(x2, y2);

          this.graphic = item;
          borders.push(item);
        });
      this._borders = borders;
      this.addChild(...this._borders);
    }

    if (this._options.dots) {
      const dots = [];
      this._shadowDots = this._shadow
        .selectAll('.dot')
        .data(this._linesRates)
        .enter()
        .append('shadow')
        .attr('class', 'dot')
        .attr('id', (d, i) => `locator_dots_${i + 1}`)
        .attr('x', (d) => d[0] * 12)
        .attr('y', (d) => d[1] * 12)
        .each(function ([x, y]) {
          const item = new PIXI.Graphics();
          item.lineStyle(1, 0xffffff, 1);
          const ySign = Math.sign(y);
          x = x !== 0 ? 0 : 4;
          y = y !== 0 ? 0 : 4;
          item.moveTo(x ? -x + 0.5 : 0.5, y ? -y - 0.5 : ySign * 0.5);
          item.lineTo(x ? x + 0.5 : 0.5, y ? y - 0.5 : ySign * 0.5);

          this.graphic = item;
          dots.push(item);
        });
      this._dots = dots;
      this.addChild(...this._dots);
    }

    if (this._options.rect) {
      const rect = new PIXI.Graphics();
      this._shadowRect = this._shadow
        .append('shadow')
        .attr('class', 'rect')
        .attr('x0', 0)
        .attr('y0', 0)
        .attr('x1', 0)
        .attr('y1', 0)
        .each(bindGraphic(rect));
      rect.roundPixels = true;
      this._rect = rect;
      this.addChild(rect);
    }
  }

  focusOn(...args) {
    if (!args.length) {
      return this._focused;
    }

    if (this._pressed) {
      return this;
    }

    const [node] = args;

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
    this._pressed = false;
    if (!this._focused) {
      return this;
    }

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
    this.moveToPoint(x, y);
  }

  moveToPoint(x, y) {
    this._shadowMain
      .attr('x', x)
      .attr('y', y);
  }

  show() {
    this.alpha = 0.001;
    this._shadowMain
      .attr('opacity', this.alpha)
      .transition('fade')
      .duration(duration)
      .attr('opacity', 1);
  }

  hide() {
    this._shadowMain
      .transition('fade')
      .duration(duration)
      .attr('opacity', 0);
  }

  _expand() {
    const bounds = this._focused.getLocalBounds();

    const { width, height, x, y } = bounds;

    const w2 = width * 0.5;
    const h2 = height * 0.5;
    const pos = this._focused.getGlobalPosition(undefined, true);

    if (x >= 0 || width / Math.abs(x) !== 2) {
      pos.x += x + w2;
    }

    if (y >= 0 || height / Math.abs(y) !== 2) {
      pos.y += y + h2;
    }

    this._shadowMain
      .transition('move')
      .duration(duration)
      .attr('x', pos.x)
      .attr('y', pos.y);

    const offset = this._pressed ? 0 : 5;

    if (this._lines) {
      this._shadowLines
        .transition('line-move')
        .duration(duration)
        .attr('x', (d) => d[0] * Math.max(w2 + offset, 12))
        .attr('y', (d) => d[1] * Math.max(h2 + offset, 12));
    }

    if (this._borders) {
      this._shadowBorders
        .transition('border-move')
        .duration(duration)
        .attr('x', ([x]) => Math.sign(x) * -1 * Math.max(w2 + offset, 12))
        .attr('y', ([, y]) => Math.sign(y) * -1 * Math.max(h2 + offset, 12));
    }

    if (this._dots) {
      this._shadowDots
        .transition('dot-move')
        .duration(duration)
        .attr('x', (d) => d[0] * Math.max(w2 + offset, 12))
        .attr('y', (d) => d[1] * Math.max(h2 + offset, 12));
    }

    if (this._rect) {
      const [[x0, y0], , [x2, y2]] = this._bordersBasePoints;
      this._shadowRect
        .transition('rect-move')
        .duration(duration)
        .attr('x0', Math.sign(x0) * -1 * Math.max(w2 + offset, 12))
        .attr('y0', Math.sign(y0) * -1 * Math.max(h2 + offset, 12))
        .attr('x1', Math.sign(x2) * -1 * Math.max(w2 + offset, 12))
        .attr('y1', Math.sign(y2) * -1 * Math.max(h2 + offset, 12));
    }
  }

  _reduce() {
    if (this._lines) {
      this._shadowLines
        .transition('line-move')
        .duration(duration)
        .attr('x', (d) => d[0] * 12)
        .attr('y', (d) => d[1] * 12);
    }

    if (this._borders) {
      this._shadowBorders
        .transition('border-move')
        .duration(duration)
        .attr('x', (d) => d[0])
        .attr('y', (d) => d[1]);
    }

    if (this._dots) {
      this._shadowDots
        .transition('dot-move')
        .duration(duration)
        .attr('x', (d) => d[0] * 12)
        .attr('y', (d) => d[1] * 12);
    }

    if (this._rect) {
      this._shadowRect
        .transition('rect-move')
        .duration(duration)
        .attr('x0', 0)
        .attr('y0', 0)
        .attr('x1', 0)
        .attr('y1', 0);
    }
  }

  _render() {
    const attrs = this._shadowMain.node().attributes;
    this.x = +attrs.x.value;
    this.y = +attrs.y.value;
    this.alpha = +attrs.opacity.value;

    this._firstRendering = this._firstRendering ?? true;

    if (this._firstRendering || hasTransition(this._shadowLines)) {
      this._shadowLines?.each(updatePosition);
    }

    if (this._firstRendering || hasTransition(this._shadowBorders)) {
      this._shadowBorders?.each(updatePosition);
    }

    if (this._firstRendering || hasTransition(this._shadowDots)) {
      this._shadowDots?.each(updatePosition);
    }

    if (this._firstRendering || hasTransition(this._shadowRect)) {
      this._shadowRect?.each(drawRect);
    }

    this._firstRendering = false;
  }
}
