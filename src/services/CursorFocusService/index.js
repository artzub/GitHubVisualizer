import Wrapper from './wrapper';

export const cursor = new Wrapper();
export const focus = new Wrapper({
  lines: false,
  cross: false,
  rect: true,
  dots: true,
});
