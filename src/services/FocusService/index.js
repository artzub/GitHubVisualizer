import Cursor from '@/shared/graphics/Cursor';

const options = {
  lines: false,
  cross: false,
  rect: true,
  dots: true,
};

let cursor = new Cursor(options);

const getGlobalPosition = function () {
  const { top, left, width, height } = this.getBoundingClientRect();

  const x = left + width * 0.5;
  const y = top + height * 0.5;

  return { x, y };
};

export const getInstance = () => {
  if (!cursor?.transform) {
    cursor = new Cursor(options);
  }
  return cursor;
};
export const focusOn = (node) => {
  if (!node?.getLocalBounds && node?.getBoundingClientRect) {
    node.getLocalBounds = node.getBoundingClientRect.bind(node);
    node.getGlobalPosition = getGlobalPosition.bind(node);
  }

  cursor.focusOn(node);
};
export const onPointerMove = (event) => {
  cursor.onPointerMove(event);
};

export const press = () => cursor.press();
export const release = () => cursor.release();
export const resize = (...args) => cursor.resize(...args);
export const hide = () => cursor.hide();
export const show = () => cursor.show();
