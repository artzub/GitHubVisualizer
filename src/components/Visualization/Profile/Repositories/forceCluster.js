import { rollup } from 'd3-array';

import { centroid } from './centroid';

const forceCluster = () => {
  let strength = 0.2;
  let radius = (node) => node.r;
  let group = (node) => node.data.group;
  let nodes;
  let getCentroid = centroid(radius);

  const force = (alpha) => {
    const centroids = rollup(nodes, getCentroid, group);
    const l = alpha * strength;

    nodes.forEach((node) => {
      const { x: cx, y: cy } = centroids.get(group(node));
      node.vx -= (node.x - cx) * l;
      node.vy -= (node.y - cy) * l;
    });
  };

  force.strength = (...args) => {
    if (args.length < 1) {
      return strength;
    }
    strength = +args[0];
    return force;
  };

  force.group = (...args) => {
    if (args.length < 1) {
      return group;
    }
    group = args[0];
    return force;
  };

  force.radius = (...args) => {
    if (args.length < 1) {
      return radius;
    }
    radius = args[0];
    getCentroid = centroid(radius);
    return force;
  };

  force.initialize = (_) => {
    nodes = _;
  };

  return force;
};

export default forceCluster;
