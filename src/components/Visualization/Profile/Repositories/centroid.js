export const centroid = (radius) => (nodes) => {
  const [x, y, z] = (nodes || []).reduce(([x, y, z], node) => {
    const k = radius(node) ** 2;

    return [
      x + node.x * k,
      y + node.y * k,
      z + k,
    ];
  }, [0, 0, 0]);

  return {
    x: x / z,
    y: y / z,
  };
};
