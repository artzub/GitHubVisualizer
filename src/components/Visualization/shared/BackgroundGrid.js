import * as PIXI from 'pixi.js';

const defaultCellSize = 100;

const cross = (size) => {
  const sizeHalf = size * 0.5;
  const item = new PIXI.Graphics();
  item.roundPixels = true;
  item.lineStyle(1, 0xffffff, 0.15, 0.5);
  item.moveTo(sizeHalf - 1.5, -sizeHalf);
  item.lineTo(sizeHalf - 1.5, size);
  item.moveTo(-sizeHalf, sizeHalf - 2);
  item.lineTo(size, sizeHalf - 2);

  return item;
};

class BackgroundGrid extends PIXI.Container {
  _cellSize = defaultCellSize;

  constructor(cellSize) {
    super();

    this.roundPixels = true;
    this._boundsPadding = 10;
    this._cellSize = Math.max(cellSize || defaultCellSize, 10);
  }

  cellSize(...args) {
    if (!args.length) {
      return this._cellSize;
    }

    this._cellSize = Math.max(+args[0], 10);

    return this;
  }

  resize(width, height) {
    const children = [];
    let item;

    const pad = this._boundsPadding;
    let countCellWidth = Math.floor(width / this._cellSize);
    countCellWidth += countCellWidth % 2 + 4;
    let countCellHeight = Math.floor(height / this._cellSize);
    countCellHeight += countCellHeight % 2 + 4;
    const size = this._cellSize;
    const stickSizeBorder = 26;

    item = new PIXI.Graphics();
    item.lineStyle(2, 0xffffff, 1, 0.5);
    item.moveTo(stickSizeBorder, pad);
    item.lineTo(pad, pad);
    item.lineTo(pad, stickSizeBorder);
    children.push(item);

    item = new PIXI.Graphics();
    item.lineStyle(2, 0xffffff, 1, 0.5);
    item.moveTo(width - stickSizeBorder, pad);
    item.lineTo(width - pad, pad);
    item.lineTo(width - pad, stickSizeBorder);
    children.push(item);

    item = new PIXI.Graphics();
    item.lineStyle(2, 0xffffff, 1, 0.5);
    item.moveTo(stickSizeBorder, height - pad);
    item.lineTo(pad, height - pad);
    item.lineTo(pad, height - stickSizeBorder);
    children.push(item);

    item = new PIXI.Graphics();
    item.lineStyle(2, 0xffffff, 1, 0.5);
    item.moveTo(width - stickSizeBorder, height - pad);
    item.lineTo(width - pad, height - pad);
    item.lineTo(width - pad, height - stickSizeBorder);
    children.push(item);

    const w2 = width * 0.5;
    const h2 = height * 0.5;

    for (let i = 0; i < countCellWidth * 0.5; i++) {
      for (let j = 0; j < countCellHeight * 0.5; j++) {
        item = cross(8);
        item.x = w2 - i * size;
        item.y = h2 - j * size;
        children.push(item);
      }
    }

    for (let i = 1; i < countCellWidth * 0.5; i++) {
      for (let j = 0; j < countCellHeight * 0.5; j++) {
        item = cross(8);
        item.x = w2 + i * size;
        item.y = h2 - j * size;
        children.push(item);
      }
    }

    for (let i = 0; i < countCellWidth * 0.5; i++) {
      for (let j = 1; j < countCellHeight * 0.5; j++) {
        item = cross(8);
        item.x = w2 - i * size;
        item.y = h2 + j * size;
        children.push(item);
      }
    }

    for (let i = 1; i < countCellWidth * 0.5; i++) {
      for (let j = 1; j < countCellHeight * 0.5; j++) {
        item = cross(8);
        item.x = w2 + i * size;
        item.y = h2 + j * size;
        children.push(item);
      }
    }


    this.removeChildren();
    this.addChild(...children);

    return this;
  }
}

export default BackgroundGrid;
