import Cursor from '@/shared/graphics/Cursor';

const getGlobalPosition = function () {
  const { top, left, width, height } = this.getBoundingClientRect();

  const x = left + width * 0.5;
  const y = top + height * 0.5;

  return { x, y };
};

class Wrapper {
  constructor(options) {
    this._options = options;
  }

  getInstance = () => {
    if (!this._cursor?.transform) {
      this._cursor = new Cursor(this._options);
    }

    return this._cursor;
  }

  focusOn = (node) => {
    if (!node?.getLocalBounds && node?.getBoundingClientRect) {
      node.getLocalBounds = node.getBoundingClientRect.bind(node);
      node.getGlobalPosition = getGlobalPosition.bind(node);
    }

    this.getInstance().focusOn(node);
  }

  onPointerMove = (event) => {
    this.getInstance().onPointerMove(event);
  }

  press = () => this.getInstance().press();
  release = () => this.getInstance().release();
  resize = (...args) => this.getInstance().resize(...args);
  hide = () => this.getInstance().hide();
  show = () => this.getInstance().show();
}

export default Wrapper;
