const checkTransition = (node) => node.__transition;

export const hasTransition = (selection) => {
  return !!selection?.nodes().some(checkTransition);
};
