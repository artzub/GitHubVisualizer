export const centroid = (radius) => (nodes) => {
  const [x, y, z] = (nodes || []).reduce(
    ([_x, _y, _z], node) => {
      const k = radius(node) ** 2;

      return [_x + node.x * k, _y + node.y * k, _z + k];
    },
    [0, 0, 0],
  );

  return {
    x: x / z,
    y: y / z,
  };
};
